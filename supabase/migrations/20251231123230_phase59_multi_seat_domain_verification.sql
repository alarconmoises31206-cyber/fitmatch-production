-- Phase 59: Multi-Seat User Invites + Domain Verification

-- org_users: associates users with organizations, tracks seat usage
CREATE TABLE IF NOT EXISTS public.org_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- references auth.users(id) via Supabase Auth
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'revoked'
    UNIQUE(org_id, user_id),
    UNIQUE(org_id, email) -- one org per email
);

-- domain_verifications: verified domains for auto-join/request
CREATE TABLE IF NOT EXISTS public.domain_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    verification_method TEXT NOT NULL, -- 'email', 'dns'
    token TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(org_id, domain)
);

-- join_requests: requests from users with verified domain to join org
CREATE TABLE IF NOT EXISTS public.join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    domain TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_users_org_id ON public.org_users(org_id);
CREATE INDEX IF NOT EXISTS idx_org_users_user_id ON public.org_users(user_id);
CREATE INDEX IF NOT EXISTS idx_org_users_status ON public.org_users(status);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain ON public.domain_verifications(domain);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_org_id ON public.domain_verifications(org_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_org_id ON public.join_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON public.join_requests(status);

-- Function to check seat availability (will be used in triggers/application logic)
CREATE OR REPLACE FUNCTION check_seat_availability(org_uuid UUID)
RETURNS BOOLEAN AS \$\$
DECLARE
    used_seats INTEGER;
    seat_limit INTEGER;
BEGIN
    SELECT COUNT(*) INTO used_seats
    FROM public.org_users
    WHERE org_id = org_uuid AND status = 'active';

    SELECT seat_limit INTO seat_limit
    FROM public.orgs
    WHERE id = org_uuid;

    RETURN used_seats < seat_limit;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;
