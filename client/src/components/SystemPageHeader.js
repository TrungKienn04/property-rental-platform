import React from "react";

const SystemPageHeader = ({ eyebrow = "Tài khoản", title, description, action }) => {
  return (
    <section className="surface-card rounded-[24px] px-5 py-5 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
            {eyebrow}
          </p>
          <div className="space-y-2">
            <h1 className="text-[30px] font-extrabold leading-tight text-slate-950">
              {title}
            </h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-7 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </div>
    </section>
  );
};

export default SystemPageHeader;
