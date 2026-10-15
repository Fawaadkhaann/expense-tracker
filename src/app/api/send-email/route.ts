import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check login
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to send emails." },
        { status: 401 },
      );
    }

    // Read and validate email details
    const body = await request.json();

    const to = body.to;
    const subject = body.subject;
    const message = body.message;

    if (
      typeof to !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string" ||
      !to.trim() ||
      !subject.trim() ||
      !message.trim() ||
      to.length > 254 ||
      subject.length > 200 ||
      message.length > 10000
    ) {
      return NextResponse.json(
        { error: "Please provide valid email details." },
        { status: 400 },
      );
    }

    // Send email through Resend
    const result = await resend.emails.send({
      from: "Ledger <onboarding@resend.dev>",
      to: [to.trim()],
      subject: subject.trim(),
      text: message,
    });

    if (result.error) {
      console.error("Resend email error:", result.error);

      return NextResponse.json(
        {
          error:
            "Email could not be sent. Please check your Resend setup.",
        },
        { status: 502 },
      );
    }

    // Save successful email activity in Supabase
    const { error: saveError } = await supabase
      .from("email_activity")
      .insert({
        user_id: user.id,
        recipient: to.trim(),
        subject: subject.trim(),
        status: "sent",
        resend_id: result.data?.id ?? null,
      });

    if (saveError) {
      console.error("Email activity save error:", saveError);

      return NextResponse.json({
        success: true,
        message:
          "Email sent, but its activity could not be saved.",
        id: result.data?.id,
        activitySaved: false,
      });
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
      id: result.data?.id,
      activitySaved: true,
    });
  } catch (error) {
    console.error("Email API error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the email.",
      },
      { status: 500 },
    );
  }
}