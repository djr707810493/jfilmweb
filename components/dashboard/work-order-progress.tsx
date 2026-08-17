import {
  WORK_ORDER_STATUS_OPTIONS,
  getWorkOrderProgressIndex,
  workOrderStatusDescription,
  workOrderStatusLabel,
  type WorkOrderStatus,
} from "@/types/work-order";

type WorkOrderProgressProps = {
  status: WorkOrderStatus;
  compact?: boolean;
};

export function WorkOrderProgress({
  status,
  compact = false,
}: WorkOrderProgressProps) {
  const currentIndex = getWorkOrderProgressIndex(status);
  const totalSteps = WORK_ORDER_STATUS_OPTIONS.length;
  const progressPercent =
    totalSteps <= 1 ? 100 : (currentIndex / (totalSteps - 1)) * 100;

  if (compact) {
    return (
      <div className="space-y-2" aria-label="Work order progress">
        <div className="h-1 overflow-hidden rounded-full bg-taupe/30">
          <div
            className="h-full rounded-full bg-soft-black transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[0.6875rem] leading-snug text-soft-black-muted sm:text-xs">
          <span className="font-medium text-soft-black">
            {workOrderStatusLabel(status)}
          </span>
          {" · "}
          Step {currentIndex + 1} of {totalSteps}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="label-editorial text-[0.5625rem] text-muted sm:text-[0.625rem]">
        Project progress
      </p>

      {/* Mobile: vertical timeline */}
      <ol
        className="space-y-0 md:hidden"
        aria-label="Work order progress"
      >
        {WORK_ORDER_STATUS_OPTIONS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === WORK_ORDER_STATUS_OPTIONS.length - 1;

          return (
            <li key={step.value} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-[0.5625rem] top-5 h-[calc(100%-0.25rem)] w-px ${
                    isComplete ? "bg-soft-black/35" : "bg-taupe/40"
                  }`}
                  aria-hidden
                />
              )}
              <StepDot
                isComplete={isComplete}
                isCurrent={isCurrent}
                isUpcoming={index > currentIndex}
                size="sm"
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-sm leading-snug ${
                    isCurrent
                      ? "font-medium text-soft-black"
                      : isComplete
                        ? "text-soft-black-muted"
                        : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="mt-1 text-xs leading-relaxed text-soft-black-muted">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal steps */}
      <ol
        className="hidden gap-2 md:grid md:grid-cols-6"
        aria-label="Work order progress"
      >
        {WORK_ORDER_STATUS_OPTIONS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.value} className="relative min-w-0">
              {index < WORK_ORDER_STATUS_OPTIONS.length - 1 && (
                <span
                  className={`absolute left-[calc(50%+0.625rem)] top-2.5 h-px w-[calc(100%-1.25rem)] ${
                    isComplete ? "bg-soft-black/35" : "bg-taupe/40"
                  }`}
                  aria-hidden
                />
              )}
              <div className="relative z-[1] flex flex-col items-center text-center">
                <StepDot
                  isComplete={isComplete}
                  isCurrent={isCurrent}
                  isUpcoming={index > currentIndex}
                />
                <p
                  className={`mt-2 text-[0.6875rem] leading-snug ${
                    isCurrent
                      ? "font-medium text-soft-black"
                      : isComplete
                        ? "text-soft-black-muted"
                        : "text-muted"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-soft-black-muted sm:text-sm">
        {workOrderStatusDescription(status)}
      </p>
    </div>
  );
}

function StepDot({
  isComplete,
  isCurrent,
  isUpcoming,
  size = "md",
}: {
  isComplete: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-[1.125rem] w-[1.125rem]" : "h-5 w-5";
  const inner = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  if (isCurrent) {
    return (
      <span
        className={`relative flex shrink-0 items-center justify-center ${dimension}`}
      >
        <span className={`absolute rounded-full bg-soft-black/10 ${dimension}`} />
        <span
          className={`relative rounded-full bg-soft-black ring-2 ring-soft-black/20 ring-offset-2 ring-offset-ivory ${inner}`}
        />
      </span>
    );
  }

  if (isComplete) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-soft-black text-[0.5625rem] text-ivory ${dimension}`}
      >
        ✓
      </span>
    );
  }

  return (
    <span
      className={`block shrink-0 rounded-full border ${dimension} ${
        isUpcoming ? "border-taupe/60 bg-ivory" : "border-taupe bg-ivory-dark"
      }`}
    />
  );
}
