import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/Shell";
import { ProjectInformationTree } from "@/components/tree/ProjectInformationTree";
import { projectDetail, projects } from "@/data/mock";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "项目信息管理 · 摇人吧" },
      { name: "description", content: "通过可折叠信息树共同维护项目车辆、软件、环境、人员与配置资料。" },
      { property: "og:title", content: "项目信息管理 · 摇人吧" },
      { property: "og:description", content: "通过可折叠信息树共同维护完整项目信息。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const project = projects.find((item) => item.code === id);
  const projectName = project?.name ?? `项目 ${id}`;

  return (
    <PageShell title="项目信息管理" back>
      <ProjectInformationTree
        projectCode={id}
        projectName={projectName}
        overview={{
          client: projectDetail.client,
          wecomId: projectDetail.wecomId,
          manager: projectDetail.manager,
          contact: projectDetail.contact,
          progress: project?.progress ?? projectDetail.progress,
          deployAt: projectDetail.deployAt,
          nearDelivery: projectDetail.nearDelivery,
          finalDelivery: projectDetail.finalDelivery,
          tags: projectDetail.tags,
          urgent: projectDetail.urgent,
        }}
      />
    </PageShell>
  );
}