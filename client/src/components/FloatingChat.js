import React, { useId, useState } from "react";
import icons from "../ultils/icons";

const { GrFormClose, FiSend } = icons;

const ChatMark = ({ compact = false }) => {
  const gradientId = useId().replace(/:/g, "");
  const bodyId = `${gradientId}-body`;
  const bubbleId = `${gradientId}-bubble`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={compact ? "h-7 w-7" : "h-8 w-8"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="8"
        y="10"
        width="48"
        height="34"
        rx="16"
        fill={`url(#${bodyId})`}
      />
      <path
        d="M22 46L20 56L31.2 47.7H44C50.627 47.7 56 42.327 56 35.7V26.3C56 19.673 50.627 14.3 44 14.3H20C13.373 14.3 8 19.673 8 26.3V34.2C8 40.827 13.373 46.2 20 46.2H22V46Z"
        fill={`url(#${bubbleId})`}
      />
      <circle cx="22" cy="30" r="3.5" fill="white" />
      <circle cx="32" cy="30" r="3.5" fill="white" fillOpacity="0.92" />
      <circle cx="42" cy="30" r="3.5" fill="white" fillOpacity="0.84" />
      <path
        d="M50 12L52 7L47 9"
        stroke="#FDBA74"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={bodyId}
          x1="8"
          y1="10"
          x2="56"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient
          id={bubbleId}
          x1="8"
          y1="16"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#FACC15" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState({});

  const faqs = [
    {
      q: "Đăng tin quảng cáo trên TroMoi.com có hiệu quả không?",
      a: "Có — TroMoi có ~300k lượt truy cập/tháng và >2M lượt xem/tháng, phù hợp để quảng cáo cho thuê.",
    },
    {
      q: "Làm thế nào để đăng tin lên TroMoi.com?",
      a: "Đăng ký tài khoản, đăng nhập rồi nhấn 'Đăng tin' — (Desktop: nút Đăng ký góc trên phải; Mobile: phía dưới).",
    },
    {
      q: "Vào đâu để xem/chỉnh/ẩn tin đã đăng?",
      a: "Vào 'Quản lý tài khoản' → 'Quản lý tin đăng', dùng nút 'Sửa' hoặc 'Ẩn' bên phải từng tin.",
    },
    {
      q: "Chi phí đăng tin như thế nào?",
      a: "TroMoi có gói miễn phí và gói trả phí ưu tiên hiển thị; liên hệ hỗ trợ để biết chi tiết.",
    },
    {
      q: "Làm sao để liên hệ khi cần hỗ trợ?",
      a: "Gọi hotline 0978 522 921, email cskh.TroMoi@gmail.com hoặc dùng chat này.",
    },
  ];

  const toggleFaq = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 sm:bottom-6 sm:left-6">
      {isOpen && (
        <div className="absolute bottom-16 left-0 mb-4 w-[360px] overflow-hidden rounded-[28px] border border-white/60 bg-white/96 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-300">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#f97316_100%)] px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/12 p-2.5 backdrop-blur">
                  <ChatMark compact />
                </div>
                <div>
                  <h4 className="font-semibold">Hỗ trợ trực tuyến</h4>
                  <p className="mt-1 text-xs text-slate-200">
                    Nhắn nhanh để được hỗ trợ thao tác đăng tin hoặc tìm phòng.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 transition hover:bg-white/10"
              >
                <GrFormClose size={20} />
              </button>
            </div>
          </div>

          <div className="h-[305px] bg-[linear-gradient(180deg,#fff9f2_0%,#ffffff_100%)] p-4">
            <div className="h-full flex flex-col gap-3">
              <div className="flex-1 overflow-auto pr-1">
                <div className="space-y-3">
                  {/* welcome note removed per request */}
                  <div className="text-sm text-slate-500">
                    Chọn câu hỏi bên dưới để xem trả lời nhanh.
                  </div>
                  <div className="grid gap-2">
                    <a
                      href="tel:0978522921"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      Gọi hotline: 0978 522 921
                    </a>
                    <a
                      href="mailto:cskh.TroMoi@gmail.com"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    >
                      Email: cskh.TroMoi@gmail.com
                    </a>
                  </div>

                  <div className="mt-2">
                    <p className="mb-2 text-xs font-semibold text-slate-500">
                      Câu hỏi nhanh
                    </p>
                    <div className="flex flex-col gap-2">
                      {faqs.map((faq, i) => (
                        <div key={i} className="w-full">
                          <button
                            type="button"
                            onClick={() => toggleFaq(i)}
                            aria-expanded={!!expanded[i]}
                            className={`w-full text-left rounded-2xl border px-4 py-3 text-sm font-medium transition flex items-start gap-3 ${
                              expanded[i]
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800"
                            }`}
                          >
                            <span className="flex-1 whitespace-normal break-words text-left">
                              {faq.q}
                            </span>
                            <span className="ml-3 flex-none text-xs text-slate-400">
                              {expanded[i] ? "-" : "+"}
                            </span>
                          </button>

                          <div
                            style={{
                              maxHeight: expanded[i] ? "240px" : "0px",
                              opacity: expanded[i] ? 1 : 0,
                              transition:
                                "max-height 240ms ease, opacity 200ms ease",
                              overflow: "hidden",
                            }}
                            className="mt-2"
                          >
                            <div className="rounded-2xl bg-white text-sm text-slate-700 border border-amber-100 p-3">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  className="w-full flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-amber-200 focus:ring-2 focus:ring-amber-100"
                />
                <button
                  type="button"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#f97316_100%)] text-white shadow-[0_18px_45px_rgba(249,115,22,0.28)] transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          animation: !isOpen ? "chat-float 3.2s ease-in-out infinite" : "none",
        }}
      >
        <span
          className={
            isOpen ? "absolute scale-0 opacity-0" : "scale-100 opacity-100"
          }
        >
          <ChatMark />
        </span>
        <span
          className={
            isOpen
              ? "scale-100 opacity-100 transition-all duration-300"
              : "absolute scale-0 opacity-0 transition-all duration-300"
          }
        >
          <GrFormClose size={28} />
        </span>

        {!isOpen && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
