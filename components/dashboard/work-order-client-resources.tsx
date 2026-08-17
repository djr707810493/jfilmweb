import {
  hasWorkOrderClientResources,
  type WorkOrderRecord,
} from "@/types/work-order";

type WorkOrderClientResourcesProps = {
  workOrder: Pick<WorkOrderRecord, "contractLink" | "workDriveLink">;
};

export function WorkOrderClientResources({
  workOrder,
}: WorkOrderClientResourcesProps) {
  const contractLink = workOrder.contractLink?.trim();
  const workDriveLink = workOrder.workDriveLink?.trim();

  if (!hasWorkOrderClientResources(workOrder)) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-taupe/20 pt-4">
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        Your resources
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {contractLink && (
          <ResourceLink
            href={contractLink}
            label="Contract"
            description="Review and sign your agreement"
          />
        )}
        {workDriveLink && (
          <ResourceLink
            href={workDriveLink}
            label="Work Drive"
            description="Access shared files and deliverables"
          />
        )}
      </div>
    </div>
  );
}

function ResourceLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  const safeHref = normalizeExternalUrl(href);

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[3.25rem] min-w-0 flex-1 items-center gap-3 border border-taupe/30 bg-ivory-dark/50 px-4 py-3.5 transition-colors active:bg-ivory-dark sm:items-start sm:py-3"
    >
      <span className="label-editorial shrink-0 text-[0.5625rem] text-muted group-hover:text-soft-black sm:mt-0.5">
        Open
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-display block text-base text-soft-black">
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-soft-black-muted">
          {description}
        </span>
      </span>
    </a>
  );
}

function normalizeExternalUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
