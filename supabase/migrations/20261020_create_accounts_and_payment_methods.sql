BEGIN;

-- 1. ACCOUNTS

CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  account_type text NOT NULL CHECK (
    account_type IN ('cash', 'bank', 'mobile_wallet', 'credit_card', 'other')
  ),
  currency text NOT NULL DEFAULT 'PKR' CHECK (currency = 'PKR'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE INDEX accounts_user_created_idx
ON public.accounts (user_id, created_at DESC);

CREATE TRIGGER accounts_set_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2. PAYMENT METHODS
-- Never store full card numbers, CVVs, or PINs.

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  method_type text NOT NULL CHECK (
    method_type IN (
      'cash', 'debit_card', 'credit_card',
      'bank_transfer', 'mobile_wallet', 'other'
    )
  ),
  provider text CHECK (
    provider IS NULL OR char_length(provider) <= 100
  ),
  last_four text CHECK (
    last_four IS NULL OR last_four ~ '^[0-9]{4}$'
  ),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE RESTRICT
);

CREATE INDEX payment_methods_user_created_idx
ON public.payment_methods (user_id, created_at DESC);

CREATE INDEX payment_methods_account_user_idx
ON public.payment_methods (account_id, user_id)
WHERE account_id IS NOT NULL;

CREATE TRIGGER payment_methods_set_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3. LINK EXISTING EXPENSES TO ACCOUNTS
-- Existing expenses remain unassigned.

ALTER TABLE public.expenses
  ADD COLUMN account_id uuid,
  ADD COLUMN payment_method_id uuid;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_id_user_unique UNIQUE (id, user_id);

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_account_user_fkey
  FOREIGN KEY (account_id, user_id)
  REFERENCES public.accounts(id, user_id)
  ON DELETE RESTRICT;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_payment_method_user_fkey
  FOREIGN KEY (payment_method_id, user_id)
  REFERENCES public.payment_methods(id, user_id)
  ON DELETE RESTRICT;

CREATE INDEX expenses_account_user_idx
ON public.expenses (account_id, user_id)
WHERE account_id IS NOT NULL;

CREATE INDEX expenses_payment_method_user_idx
ON public.expenses (payment_method_id, user_id)
WHERE payment_method_id IS NOT NULL;

-- 4. TRANSACTION HISTORY

CREATE TABLE public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL,
  payment_method_id uuid,
  expense_id uuid,
  transfer_group_id uuid,
  transaction_type text NOT NULL CHECK (
    transaction_type IN (
      'opening_balance', 'income', 'expense',
      'deposit', 'withdrawal', 'refund',
      'adjustment', 'transfer_in', 'transfer_out'
    )
  ),
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  balance_effect numeric(12, 2) NOT NULL CHECK (balance_effect <> 0),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  description text CHECK (
    description IS NULL OR char_length(description) <= 500
  ),
  created_at timestamptz NOT NULL DEFAULT now(),

  FOREIGN KEY (account_id, user_id)
    REFERENCES public.accounts(id, user_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (payment_method_id, user_id)
    REFERENCES public.payment_methods(id, user_id)
    ON DELETE RESTRICT,

  FOREIGN KEY (expense_id, user_id)
    REFERENCES public.expenses(id, user_id)
    ON DELETE CASCADE,

  CONSTRAINT transactions_expense_unique UNIQUE (expense_id),

  CHECK (
    (transaction_type = 'expense') = (expense_id IS NOT NULL)
  ),

  CHECK (
    (transaction_type IN ('transfer_in', 'transfer_out'))
    = (transfer_group_id IS NOT NULL)
  )
);

CREATE INDEX financial_transactions_account_date_idx
ON public.financial_transactions (account_id, transaction_date DESC);

CREATE INDEX financial_transactions_user_date_idx
ON public.financial_transactions (user_id, transaction_date DESC);

CREATE INDEX financial_transactions_account_user_idx
ON public.financial_transactions (account_id, user_id);

CREATE INDEX financial_transactions_payment_method_user_idx
ON public.financial_transactions (payment_method_id, user_id)
WHERE payment_method_id IS NOT NULL;

CREATE INDEX financial_transactions_transfer_group_idx
ON public.financial_transactions (transfer_group_id)
WHERE transfer_group_id IS NOT NULL;
-- 5. VALIDATE ACCOUNT AND PAYMENT METHOD LINKS

CREATE FUNCTION public.validate_financial_account_links()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_account_active boolean;
  v_method_active boolean;
  v_method_account uuid;
BEGIN
  IF NEW.account_id IS NULL THEN
    IF NEW.payment_method_id IS NOT NULL THEN
      RAISE EXCEPTION 'A payment method requires an account.';
    END IF;
    RETURN NEW;
  END IF;

  SELECT a.is_active
  INTO v_account_active
  FROM public.accounts AS a
  WHERE a.id = NEW.account_id
    AND a.user_id = NEW.user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or not owned by this user.';
  END IF;

  IF NOT v_account_active THEN
    RAISE EXCEPTION 'Cannot use an inactive account.';
  END IF;

  IF NEW.payment_method_id IS NOT NULL THEN
    SELECT pm.is_active, pm.account_id
    INTO v_method_active, v_method_account
    FROM public.payment_methods AS pm
    WHERE pm.id = NEW.payment_method_id
      AND pm.user_id = NEW.user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Payment method not found or not owned by this user.';
    END IF;

    IF NOT v_method_active THEN
      RAISE EXCEPTION 'Cannot use an inactive payment method.';
    END IF;

    IF v_method_account IS NOT NULL
       AND v_method_account <> NEW.account_id THEN
      RAISE EXCEPTION 'Payment method belongs to a different account.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_expense_account_links
BEFORE INSERT OR UPDATE OF account_id, payment_method_id, user_id
ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.validate_financial_account_links();

CREATE TRIGGER validate_transaction_account_links
BEFORE INSERT OR UPDATE OF account_id, payment_method_id, user_id
ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.validate_financial_account_links();

-- 6. PREVENT CHANGING AN EXISTING PAYMENT METHOD'S ACCOUNT

CREATE FUNCTION public.prevent_payment_method_relink()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    RAISE EXCEPTION
      'An existing payment method cannot be moved to another account.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_payment_method_relink
BEFORE UPDATE OF account_id
ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_method_relink();

-- 7. SYNCHRONIZE EXPENSES WITH FINANCIAL TRANSACTIONS

CREATE FUNCTION public.sync_expense_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF auth.uid() IS NOT NULL
       AND auth.uid() IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Cannot sync an expense owned by another user.';
    END IF;

    DELETE FROM public.financial_transactions
    WHERE expense_id = OLD.id
      AND user_id = OLD.user_id;

    RETURN OLD;
  END IF;

  IF auth.uid() IS NOT NULL
     AND auth.uid() IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Cannot sync an expense owned by another user.';
  END IF;

  IF NEW.account_id IS NULL THEN
    DELETE FROM public.financial_transactions
    WHERE expense_id = NEW.id
      AND user_id = NEW.user_id;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND (
       NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.amount IS DISTINCT FROM OLD.amount
       OR NEW.expense_date IS DISTINCT FROM OLD.expense_date
       OR NEW.description IS DISTINCT FROM OLD.description
     )
     AND EXISTS (
       SELECT 1
       FROM public.financial_transactions AS ft
       WHERE ft.expense_id = OLD.id
         AND ft.user_id = OLD.user_id
     ) THEN
    UPDATE public.financial_transactions
    SET
      user_id = NEW.user_id,
      account_id = NEW.account_id,
      payment_method_id = NEW.payment_method_id,
      amount = NEW.amount,
      balance_effect = -NEW.amount,
      transaction_date = NEW.expense_date,
      description = NULLIF(trim(NEW.description), '')
    WHERE expense_id = OLD.id
      AND user_id = OLD.user_id;

    RETURN NEW;
  END IF;

  INSERT INTO public.financial_transactions (
    user_id,
    account_id,
    payment_method_id,
    expense_id,
    transaction_type,
    amount,
    balance_effect,
    transaction_date,
    description
  )
  VALUES (
    NEW.user_id,
    NEW.account_id,
    NEW.payment_method_id,
    NEW.id,
    'expense',
    NEW.amount,
    -NEW.amount,
    NEW.expense_date,
    NULLIF(trim(NEW.description), '')
  )
  ON CONFLICT (expense_id)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    account_id = EXCLUDED.account_id,
    payment_method_id = EXCLUDED.payment_method_id,
    amount = EXCLUDED.amount,
    balance_effect = EXCLUDED.balance_effect,
    transaction_date = EXCLUDED.transaction_date,
    description = EXCLUDED.description;

  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_expense_financial_transaction
AFTER INSERT OR UPDATE OR DELETE
ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.sync_expense_financial_transaction();
-- 8. CREATE AN ACCOUNT WITH AN OPENING BALANCE

CREATE FUNCTION public.create_account_with_opening_balance(
  p_name text,
  p_account_type text,
  p_opening_balance numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_account uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  IF p_name IS NULL OR char_length(trim(p_name)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Account name must be between 1 and 100 characters.';
  END IF;

  IF p_account_type IS NULL OR p_account_type NOT IN (
    'cash', 'bank', 'mobile_wallet', 'credit_card', 'other'
  ) THEN
    RAISE EXCEPTION 'Invalid account type.';
  END IF;

  IF p_opening_balance IS NULL
     OR p_opening_balance < 0
     OR p_opening_balance > 9999999999.99
     OR p_opening_balance <> round(p_opening_balance, 2) THEN
    RAISE EXCEPTION 'Opening balance must be a valid non-negative amount.';
  END IF;

  INSERT INTO public.accounts (user_id, name, account_type)
  VALUES (v_user, trim(p_name), p_account_type)
  RETURNING id INTO v_account;

  IF p_opening_balance > 0 THEN
    INSERT INTO public.financial_transactions (
      user_id,
      account_id,
      transaction_type,
      amount,
      balance_effect,
      transaction_date,
      description
    )
    VALUES (
      v_user,
      v_account,
      'opening_balance',
      p_opening_balance,
      p_opening_balance,
      CURRENT_DATE,
      'Opening balance'
    );
  END IF;

  RETURN v_account;
END;
$$;

-- 9. RECORD AN ACCOUNT TRANSACTION

CREATE FUNCTION public.record_account_transaction(
  p_account_id uuid,
  p_transaction_type text,
  p_amount numeric,
  p_transaction_date date DEFAULT CURRENT_DATE,
  p_description text DEFAULT NULL,
  p_payment_method_id uuid DEFAULT NULL,
  p_direction smallint DEFAULT 1
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_account_active boolean;
  v_transaction uuid;
  v_effect numeric;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  IF p_amount IS NULL
     OR p_amount <= 0
     OR p_amount > 9999999999.99
     OR p_amount <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'Amount must be positive with at most two decimal places.';
  END IF;

  IF p_transaction_type IS NULL OR p_transaction_type NOT IN (
    'income', 'deposit', 'withdrawal',
    'refund', 'adjustment'
  ) THEN
    RAISE EXCEPTION
      'Invalid transaction type. Expense transactions are created from expenses.';
  END IF;

  IF p_transaction_type = 'adjustment' THEN
    IF p_direction IS NULL OR p_direction NOT IN (-1, 1) THEN
      RAISE EXCEPTION 'Adjustment direction must be -1 or 1.';
    END IF;
  ELSIF p_transaction_type = 'withdrawal' THEN
    p_direction := -1;
  ELSE
    p_direction := 1;
  END IF;

  SELECT a.is_active
  INTO v_account_active
  FROM public.accounts AS a
  WHERE a.id = p_account_id
    AND a.user_id = v_user
  FOR UPDATE;

  IF NOT FOUND OR NOT v_account_active THEN
    RAISE EXCEPTION 'Account not found or inactive.';
  END IF;

  v_effect := p_amount * p_direction;

  INSERT INTO public.financial_transactions (
    user_id,
    account_id,
    payment_method_id,
    transaction_type,
    amount,
    balance_effect,
    transaction_date,
    description
  )
  VALUES (
    v_user,
    p_account_id,
    p_payment_method_id,
    p_transaction_type,
    p_amount,
    v_effect,
    COALESCE(p_transaction_date, CURRENT_DATE),
    NULLIF(trim(p_description), '')
  )
  RETURNING id INTO v_transaction;

  RETURN v_transaction;
END;
$$;

-- 10. TRANSFER MONEY BETWEEN ACCOUNTS

CREATE FUNCTION public.transfer_between_accounts(
  p_from_account_id uuid,
  p_to_account_id uuid,
  p_amount numeric,
  p_transaction_date date DEFAULT CURRENT_DATE,
  p_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_transfer uuid := gen_random_uuid();
  v_count integer;
  v_active_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  IF p_from_account_id IS NULL
     OR p_to_account_id IS NULL
     OR p_from_account_id = p_to_account_id THEN
    RAISE EXCEPTION 'Choose two different accounts.';
  END IF;

  IF p_amount IS NULL
     OR p_amount <= 0
     OR p_amount > 9999999999.99
     OR p_amount <> round(p_amount, 2) THEN
    RAISE EXCEPTION 'Transfer amount must be positive with at most two decimal places.';
  END IF;

  PERFORM 1
  FROM public.accounts AS a
  WHERE a.user_id = v_user
    AND a.id IN (p_from_account_id, p_to_account_id)
  ORDER BY a.id
  FOR UPDATE;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count <> 2 THEN
    RAISE EXCEPTION 'One or both accounts were not found.';
  END IF;

  SELECT count(*)::integer
  INTO v_active_count
  FROM public.accounts AS a
  WHERE a.user_id = v_user
    AND a.id IN (p_from_account_id, p_to_account_id)
    AND a.is_active;

  IF v_active_count <> 2 THEN
    RAISE EXCEPTION 'Both accounts must be active.';
  END IF;

  INSERT INTO public.financial_transactions (
    user_id, account_id, transfer_group_id,
    transaction_type, amount, balance_effect,
    transaction_date, description
  )
  VALUES
  (
    v_user, p_from_account_id, v_transfer,
    'transfer_out', p_amount, -p_amount,
    COALESCE(p_transaction_date, CURRENT_DATE),
    NULLIF(trim(p_description), '')
  ),
  (
    v_user, p_to_account_id, v_transfer,
    'transfer_in', p_amount, p_amount,
    COALESCE(p_transaction_date, CURRENT_DATE),
    NULLIF(trim(p_description), '')
  );

  RETURN v_transfer;
END;
$$;
-- 11. READ CURRENT ACCOUNT BALANCES

CREATE FUNCTION public.get_account_balances()
RETURNS TABLE (
  account_id uuid,
  account_name text,
  account_type text,
  currency text,
  is_active boolean,
  current_balance numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    a.id,
    a.name,
    a.account_type,
    a.currency,
    a.is_active,
    COALESCE(SUM(t.balance_effect), 0)::numeric AS current_balance
  FROM public.accounts AS a
  LEFT JOIN public.financial_transactions AS t
    ON t.account_id = a.id
   AND t.user_id = a.user_id
  WHERE a.user_id = auth.uid()
  GROUP BY a.id, a.name, a.account_type, a.currency, a.is_active, a.created_at
  ORDER BY a.created_at DESC;
$$;

-- 12. ENABLE ROW LEVEL SECURITY

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
ON public.accounts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
ON public.accounts FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
ON public.accounts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods"
ON public.payment_methods FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
ON public.payment_methods FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial transactions"
ON public.financial_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 13. DATABASE PERMISSIONS

REVOKE ALL ON TABLE
  public.accounts,
  public.payment_methods,
  public.financial_transactions
FROM PUBLIC, anon, authenticated;

GRANT SELECT, UPDATE, DELETE
ON public.accounts TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.payment_methods TO authenticated;

GRANT SELECT
ON public.financial_transactions TO authenticated;

REVOKE ALL ON FUNCTION public.validate_financial_account_links()
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_payment_method_relink()
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_expense_financial_transaction()
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.create_account_with_opening_balance(text, text, numeric)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.record_account_transaction(uuid, text, numeric, date, text, uuid, smallint)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.transfer_between_accounts(uuid, uuid, numeric, date, text)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_account_balances()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_account_balances()
TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_account_with_opening_balance(text, text, numeric)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.record_account_transaction(uuid, text, numeric, date, text, uuid, smallint)
TO authenticated;

GRANT EXECUTE ON FUNCTION public.transfer_between_accounts(uuid, uuid, numeric, date, text)
TO authenticated;

COMMIT;