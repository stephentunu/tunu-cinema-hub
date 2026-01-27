-- Create a function to auto-assign admin role to specific emails
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to admin@gmail.com
  IF NEW.email = 'admin@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for admin assignment
CREATE OR REPLACE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role_on_signup();

-- Create storage bucket for movie/series uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to media bucket
CREATE POLICY "Admins can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow public read access to media files
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow admins to update media files
CREATE POLICY "Admins can update media files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete media files
CREATE POLICY "Admins can delete media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));