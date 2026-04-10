import React from "react";
import { useSelector } from "react-redux";
import { SystemPageHeader } from "../../components";

const contacts = (currentData = {}) => [
  {
    label: "Tên liên hệ",
    value: currentData?.name || "Chưa cập nhật",
    href: null,
  },
  {
    label: "Số điện thoại",
    value: currentData?.phone || "Chưa cập nhật",
    href: currentData?.phone ? `tel:${currentData.phone}` : null,
  },
  {
    label: "Zalo",
    value: currentData?.zalo || currentData?.phone || "Chưa cập nhật",
    href:
      currentData?.zalo || currentData?.phone
        ? `https://zalo.me/${currentData?.zalo || currentData?.phone}`
        : null,
  },
  {
    label: "Gmail",
    value: currentData?.email || "Chưa cập nhật",
    href: currentData?.email ? `mailto:${currentData.email}` : null,
  },
];

const ContactInfo = () => {
  const { currentData } = useSelector((state) => state.user);

  return (
    <div className="space-y-5">
      <SystemPageHeader
        eyebrow="Liên hệ"
        title="Thông tin liên hệ"
        description="Danh sách đầu mối liên hệ đang được dùng cho tài khoản hiện tại và các bài đăng của bạn."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {contacts(currentData).map((item) => {
          const isExternal = item.href?.startsWith("http");

          return (
            <article key={item.label} className="surface-card rounded-[24px] px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-4 break-words text-2xl font-bold text-slate-950">
                {item.value}
              </p>

              {item.href ? (
                <a
                  href={item.href}
                  target={isExternal ? "_blank" : undefined}
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-[42px] items-center justify-center whitespace-nowrap rounded-xl border border-slate-200 px-4 text-sm font-semibold leading-none text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Mở liên hệ
                </a>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-500">
                  Thông tin này chưa được cập nhật trong hồ sơ cá nhân.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ContactInfo;
