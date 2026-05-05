// lib/icons.ts

export const TECH_ICONS = [
  // Frontend
  { slug: "react", label: "React" },
  { slug: "nextdotjs", label: "Next.js" },
  { slug: "vuedotjs", label: "Vue.js" },
  { slug: "angular", label: "Angular" },
  { slug: "tailwindcss", label: "Tailwind CSS" },
  { slug: "typescript", label: "TypeScript" },
  { slug: "javascript", label: "JavaScript" },
  { slug: "html5", label: "HTML5" },
  { slug: "css3", label: "CSS3" },
  { slug: "sass", label: "Sass" },
  // Backend
  { slug: "nodedotjs", label: "Node.js" },
  { slug: "express", label: "Express" },
  { slug: "nestjs", label: "NestJS" },
  { slug: "python", label: "Python" },
  { slug: "django", label: "Django" },
  { slug: "dotnet", label: ".NET" },
  { slug: "fastapi", label: "FastAPI" },
  // Database
  { slug: "mongodb", label: "MongoDB" },
  { slug: "postgresql", label: "PostgreSQL" },
  { slug: "mysql", label: "MySQL" },
  { slug: "redis", label: "Redis" },
  { slug: "prisma", label: "Prisma" },
  // DevOps & Tools
  { slug: "docker", label: "Docker" },
  { slug: "kubernetes", label: "Kubernetes" },
  { slug: "git", label: "Git" },
  { slug: "github", label: "GitHub" },
  { slug: "linux", label: "Linux" },
  { slug: "nginx", label: "Nginx" },
  { slug: "vercel", label: "Vercel" },
  { slug: "amazonaws", label: "AWS" },
  // Other
  { slug: "graphql", label: "GraphQL" },
  { slug: "socketdotio", label: "Socket.io" },
  { slug: "jest", label: "Jest" },
  { slug: "figma", label: "Figma" },
] as const;

// URL آیکون از Simple Icons CDN
export function getIconUrl(slug: string, color = "ffffff") {
  return `https://cdn.simpleicons.org/${slug}/${color}`;
}
