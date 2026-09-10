import { createFileRoute } from "@tanstack/react-router";
import { ProjectActivityCard } from "@/components/project/ProjectActivityCard";
import { ProjectDetailCard } from "@/components/project/ProjectDetailCard";
import { ProjectOverviewCard } from "@/components/project/ProjectOverviewCard";
import { ProjectTicketsCard } from "@/components/project/ProjectTicketsCard";
import { PageShell } from "@/components/Shell";
import { projectDetail, projects } from "@/data/mock";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "项目详情 · 摇人吧" },
      { name: "description", content: "项目概况、详细信息、工单关系与项目动态，一处掌握项目全貌。" },
      { property: "og:title", content: "项目详情 · 摇人吧" },
      { property: "og:description", content: "项目概况、详细信息、工单关系与项目动态，一处掌握项目全貌。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const project = projects.find((item) => item.code === id);
  const projectName = project?.name ?? projectDetail.name;

  return (
    <PageShell title="项目详情" back>
      <div className="space-y-3">
        <ProjectOverviewCard
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
            agvCount: projectDetail.agvCount,
            uspVersion: projectDetail.uspVersion,
            aiSummary: projectDetail.aiSummary,
          }}
        />
        <ProjectDetailCard projectCode={id} />
        <ProjectTicketsCard projectCode={id} />
        <ProjectActivityCard />
      </div>
    </PageShell>
  );
}
