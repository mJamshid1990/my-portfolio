import { useCallback, useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminPanel } from './components/AdminPanel';
import { BlogReaderModal } from './components/BlogReaderModal';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectModal } from './components/ProjectModal';
import { ProjectsSection } from './components/ProjectsSection';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import type { BlogPost, Project } from './types/portfolio';

function PortfolioWorkspace() {
  const [activeView, setActiveView] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'public';
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const loadPublicData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projRes, postRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/posts'),
      ]);
      if (!projRes.ok || !postRes.ok) {
        throw new Error('Failed to load portfolio data.');
      }
      const projData = await projRes.json();
      const postData = await postRes.json();
      setProjects(projData.projects ?? []);
      setPosts(postData.posts ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicData();
  }, [loadPublicData]);

  const handleNavigateView = (view: 'public' | 'admin') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        view === 'admin' ? '#admin' : '#top'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 transition-colors duration-150">
      <Header activeView={activeView} onNavigateView={handleNavigateView} />

      {activeView === 'admin' ? (
        <div className="flex-1">
          <AdminPanel
            onBackToSite={() => handleNavigateView('public')}
            onPublicDataChanged={loadPublicData}
          />
        </div>
      ) : (
        <main className="flex-1">
          <Hero />
          <ProjectsSection
            projects={projects}
            loading={loading}
            error={error}
            onRetry={() => void loadPublicData()}
            onSelectProject={setSelectedProject}
          />
          <AboutSection />
          <BlogSection
            posts={posts}
            loading={loading}
            error={error}
            onSelectPost={setSelectedPost}
          />
          <ContactSection />
        </main>
      )}

      <Footer onOpenAdmin={() => handleNavigateView('admin')} />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <BlogReaderModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PortfolioWorkspace />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
