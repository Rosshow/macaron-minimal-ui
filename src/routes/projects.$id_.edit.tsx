import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/Shell";
import { ProjectInformationTree } from "@/components/tree/ProjectInformationTree";
import { projectDetail, projects } from "@/data/mock";

export const Route = createFileRoute("/projects/$id_/edit")({
  head: () => ({
    meta: [
      { title: "编辑项目信息 · 摇人吧" },
      { name: "description", content: "集中编辑项目信息树的节点标题、内容与从属关系。" },
      { property: "og:title", content: "编辑项目信息 · 摇人吧" },
      { property: "og:description", content: "集中编辑项目信息树的节点标题、内容与从属关系。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectEditPage,
});

function ProjectEditPage() {
  const { id } = Route.useParams();
  const project = projects.find((item) => item.code === id);
  const projectName = project?.name ?? `项目 ${id}`;

  return (
    <PageShell title="编辑项目信息" back>
      <ProjectInformationTree projectCode={id} projectName={projectName} />
    </PageShell>
  );
}
