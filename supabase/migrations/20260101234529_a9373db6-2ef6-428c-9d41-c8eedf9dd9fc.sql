-- Create client_tags table for custom tags per salon
CREATE TABLE public.client_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#7c3aed',
    is_system BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(salon_id, name)
);

-- Create followup_templates table
CREATE TABLE public.followup_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
    subject TEXT,
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create followup_rules table
CREATE TABLE public.followup_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    days_since_last_visit INTEGER NOT NULL DEFAULT 30,
    email_template_id UUID REFERENCES public.followup_templates(id) ON DELETE SET NULL,
    whatsapp_template_id UUID REFERENCES public.followup_templates(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create followup_queue table
CREATE TABLE public.followup_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.followup_rules(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add last_visit_at and purchase_categories to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS purchase_categories TEXT[] DEFAULT '{}';

-- Enable RLS on all new tables
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_tags
CREATE POLICY "Salon owners can manage client_tags"
ON public.client_tags FOR ALL
USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = client_tags.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view client_tags of their salon"
ON public.client_tags FOR SELECT
USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin')
);

-- RLS policies for followup_templates
CREATE POLICY "Salon owners can manage followup_templates"
ON public.followup_templates FOR ALL
USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = followup_templates.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view followup_templates of their salon"
ON public.followup_templates FOR SELECT
USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin')
);

-- RLS policies for followup_rules
CREATE POLICY "Salon owners can manage followup_rules"
ON public.followup_rules FOR ALL
USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = followup_rules.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view followup_rules of their salon"
ON public.followup_rules FOR SELECT
USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin')
);

-- RLS policies for followup_queue
CREATE POLICY "Salon owners can manage followup_queue"
ON public.followup_queue FOR ALL
USING (
    (EXISTS (SELECT 1 FROM salons WHERE salons.id = followup_queue.salon_id AND salons.owner_id = auth.uid()))
    OR has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can view followup_queue of their salon"
ON public.followup_queue FOR SELECT
USING (
    user_belongs_to_salon(auth.uid(), salon_id)
    OR has_role(auth.uid(), 'super_admin')
);

-- Create trigger to update last_visit_at on clients when appointment is completed
CREATE OR REPLACE FUNCTION public.update_client_last_visit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.client_id IS NOT NULL THEN
        UPDATE public.clients
        SET 
            last_visit_at = NEW.end_time,
            purchase_categories = (
                SELECT ARRAY_AGG(DISTINCT sc.name)
                FROM public.appointments a
                JOIN public.services s ON s.id = a.service_id
                JOIN public.service_categories sc ON sc.id = s.category_id
                WHERE a.client_id = NEW.client_id
                AND a.status = 'completed'
                AND sc.name IS NOT NULL
            )
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_client_last_visit_trigger
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_client_last_visit();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_last_visit_at ON public.clients(last_visit_at);
CREATE INDEX IF NOT EXISTS idx_clients_salon_tags ON public.clients(salon_id, tags);
CREATE INDEX IF NOT EXISTS idx_followup_queue_status ON public.followup_queue(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_client_tags_salon ON public.client_tags(salon_id);