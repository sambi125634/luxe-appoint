
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'salon_owner', 'staff');

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('booked', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create salons table
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  theme_primary_color TEXT DEFAULT '#7c3aed',
  theme_secondary_color TEXT DEFAULT '#a78bfa',
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_members table
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'specialist',
  color TEXT DEFAULT '#7c3aed',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 23,
  is_active BOOLEAN NOT NULL DEFAULT true,
  media JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staff_services junction table
CREATE TABLE public.staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (staff_id, service_id)
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_vip BOOLEAN DEFAULT false,
  is_problematic BOOLEAN DEFAULT false,
  rodo_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status NOT NULL DEFAULT 'booked',
  price DECIMAL(10,2),
  notes TEXT,
  internal_notes TEXT,
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create working_hours table
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (staff_id, day_of_week)
);

-- Create time_off table
CREATE TABLE public.time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'vacation',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for accounting
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 23,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  tip_amount DECIMAL(10,2) DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's salon_id (for salon owners)
CREATE OR REPLACE FUNCTION public.get_user_salon_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.salons WHERE owner_id = _user_id LIMIT 1
$$;

-- Function to check if user belongs to a salon (as owner or staff)
CREATE OR REPLACE FUNCTION public.user_belongs_to_salon(_user_id UUID, _salon_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.salons WHERE id = _salon_id AND owner_id = _user_id
    UNION
    SELECT 1 FROM public.staff_members WHERE salon_id = _salon_id AND user_id = _user_id
  )
$$;

-- Trigger function for new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON public.working_hours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_time_off_updated_at BEFORE UPDATE ON public.time_off FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for salons
CREATE POLICY "Salon owners can view their salons" ON public.salons FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can update their salons" ON public.salons FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admins can insert salons" ON public.salons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR owner_id = auth.uid());
CREATE POLICY "Super admins can delete salons" ON public.salons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view active salons by slug" ON public.salons FOR SELECT USING (is_active = true);

-- RLS Policies for service_categories
CREATE POLICY "Users can view categories of their salon" ON public.service_categories FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage categories" ON public.service_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view categories of active salons" ON public.service_categories FOR SELECT USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND is_active = true));

-- RLS Policies for staff_members
CREATE POLICY "Users can view staff of their salon" ON public.staff_members FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage staff" ON public.staff_members FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view active staff of active salons" ON public.staff_members FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND is_active = true));

-- RLS Policies for services
CREATE POLICY "Users can view services of their salon" ON public.services FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage services" ON public.services FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view active services of active salons" ON public.services FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND is_active = true));

-- RLS Policies for staff_services
CREATE POLICY "Users can view staff_services of their salon" ON public.staff_services FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm.id = staff_id AND public.user_belongs_to_salon(auth.uid(), sm.salon_id)) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage staff_services" ON public.staff_services FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view staff_services of active salons" ON public.staff_services FOR SELECT USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.is_active = true AND sm.is_active = true));

-- RLS Policies for clients
CREATE POLICY "Users can view clients of their salon" ON public.clients FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage clients" ON public.clients FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can insert clients for booking" ON public.clients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND is_active = true));

-- RLS Policies for appointments
CREATE POLICY "Users can view appointments of their salon" ON public.appointments FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage appointments" ON public.appointments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can insert appointments for active salons" ON public.appointments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND is_active = true));

-- RLS Policies for working_hours
CREATE POLICY "Users can view working_hours of their salon" ON public.working_hours FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm.id = staff_id AND public.user_belongs_to_salon(auth.uid(), sm.salon_id)) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage working_hours" ON public.working_hours FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view working_hours of active salons" ON public.working_hours FOR SELECT USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.is_active = true AND sm.is_active = true));

-- RLS Policies for time_off
CREATE POLICY "Users can view time_off of their salon" ON public.time_off FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm WHERE sm.id = staff_id AND public.user_belongs_to_salon(auth.uid(), sm.salon_id)) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage time_off" ON public.time_off FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Public can view time_off of active salons" ON public.time_off FOR SELECT USING (EXISTS (SELECT 1 FROM public.staff_members sm JOIN public.salons s ON s.id = sm.salon_id WHERE sm.id = staff_id AND s.is_active = true));

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions of their salon" ON public.transactions FOR SELECT TO authenticated USING (public.user_belongs_to_salon(auth.uid(), salon_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Salon owners can manage transactions" ON public.transactions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

-- Create indexes for better performance
CREATE INDEX idx_salons_owner_id ON public.salons(owner_id);
CREATE INDEX idx_salons_slug ON public.salons(slug);
CREATE INDEX idx_staff_members_salon_id ON public.staff_members(salon_id);
CREATE INDEX idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX idx_services_salon_id ON public.services(salon_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_clients_salon_id ON public.clients(salon_id);
CREATE INDEX idx_appointments_salon_id ON public.appointments(salon_id);
CREATE INDEX idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX idx_working_hours_staff_id ON public.working_hours(staff_id);
CREATE INDEX idx_time_off_staff_id ON public.time_off(staff_id);
CREATE INDEX idx_transactions_salon_id ON public.transactions(salon_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
