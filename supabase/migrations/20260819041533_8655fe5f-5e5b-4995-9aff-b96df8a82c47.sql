CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text,
  external_url text,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published posts are public" ON public.blog_posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  tech_stack text[] NOT NULL DEFAULT '{}',
  live_url text,
  repo_url text,
  cover_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects are public" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.contact_messages TO service_role;
GRANT SELECT ON public.contact_messages TO authenticated;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.hire_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  budget text,
  timeline text,
  details text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.hire_requests TO service_role;
GRANT SELECT ON public.hire_requests TO authenticated;
ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read hire requests" ON public.hire_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.blog_posts (title, slug, excerpt, content, tags, published_at) VALUES
('Building XT CORE: a cinematic boot sequence in Canvas','building-xt-core-boot-sequence','How I built a particle-driven intro that assembles the XT logo while the GitHub API loads in the background.','## Why a boot sequence\n\nMost portfolios open with a hero. XT CORE opens with a system coming online.\n\nThe loader runs a canvas particle field that converges into the XT mark while real GitHub data is fetched in parallel. The progress bar is honest: it only reaches 100% once the API responds.\n\n## Lessons\n\n- Keep the particle count adaptive to screen size.\n- Always respect prefers-reduced-motion.\n- Gate the transition on real work, never a fake timer.','{canvas,animation,frontend}', now() - interval '9 days'),
('A living interface: pointer fields, tilt cards and scroll velocity','living-interface-motion-system','A modular motion system built on CSS variables and a single requestAnimationFrame loop.','## One loop to rule them all\n\nInstead of dozens of mousemove listeners, a single rAF loop publishes smoothed pointer coordinates as CSS variables. Every parallax layer, tilt card and cursor reads those variables.\n\nThe result is depth without jank, and everything collapses gracefully when reduced motion is on.','{motion,css,performance}', now() - interval '4 days'),
('Talking to the GitHub API without a backend','github-api-live-portfolio','Rate limits, caching and shaping raw repository data into a technology matrix.','## Real data beats screenshots\n\nEvery number on this site comes from the public GitHub REST API: repositories, stars, forks, languages and commit activity.\n\nThe data layer normalises licenses and topics, computes a language matrix, and surfaces clear errors when rate limits hit instead of silently showing zeros.','{github,api,typescript}', now() - interval '1 day');

INSERT INTO public.projects (name, slug, description, tech_stack, live_url, repo_url, featured, sort_order) VALUES
('XT CORE Portfolio','xt-core-portfolio','A futuristic, GitHub-powered developer interface with a cinematic boot sequence, holographic repo drawer and live language matrix.','{React,TypeScript,TanStack Start,Tailwind,Canvas}','https://akshaygangwar.lovable.app','https://github.com/akshayxt', true, 1),
('Repo Explorer','repo-explorer','Searchable, filterable explorer over all public repositories with topic, language and license filters plus density controls.','{React,"GitHub REST API",TypeScript}', null,'https://github.com/akshayxt', true, 2),
('Life Stream','life-stream','Holographic social portal module that surfaces creative work and links out to Instagram content.','{React,CSS,Motion}', null,'https://github.com/akshayxt', false, 3),
('XT Motion Kit','xt-motion-kit','Reusable motion primitives: parallax layers, magnetic buttons, tilt cards, scroll reveals and a custom cursor.','{React,TypeScript,CSS}', null,'https://github.com/akshayxt', false, 4);