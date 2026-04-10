import React from "react";
import { Button } from "../components";
import { text } from "../ultils/dataContact";

const Contact = () => {
  return (
    <section className="rounded-[32px] bg-white p-6 shadow-sm lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
        <img
          src={text.image}
          alt="support"
          className="h-full min-h-[240px] w-full rounded-[28px] object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder.svg";
          }}
        />
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Hỗ trợ vận hành
          </p>
          <h3 className="text-3xl font-semibold text-slate-900">
            Đội ngũ hỗ trợ luôn sẵn sàng
          </h3>
          <p className="text-base leading-8 text-slate-500">{text.content}</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {text.contacts.map((item) => (
              <div
                key={item.text}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.text}
                </p>
                <a
                  href={`tel:${item.phone}`}
                  className="mt-3 block text-lg font-semibold text-slate-900"
                >
                  {item.phone}
                </a>
                <a
                  href={`https://zalo.me/${item.zalo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-sm font-medium text-amber-600"
                >
                  Zalo: {item.zalo}
                </a>
              </div>
            ))}
          </div>
          <Button
            text="Gọi hotline"
            bgColor="bg-slate-900"
            textColor="text-white"
            px="px-6"
            onClick={() => window.open(`tel:${text.contacts[0].phone}`, "_self")}
          />
        </div>
      </div>
    </section>
  );
};

export default Contact;
