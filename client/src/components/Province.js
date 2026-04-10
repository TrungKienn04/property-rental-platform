import React from "react";
import { ProvinceBtn } from "./index";
import { location } from "../ultils/constant";

const Province = () => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Khu vực nổi bật
        </p>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Đổi nhanh khu vực mà không cần quay lại trang trước
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-500">
          Bấm trực tiếp vào một tỉnh nổi bật để cập nhật danh sách tin bên dưới
          ngay tại chỗ, đồng thời vẫn giữ nguyên cụm thao tác này cho lần lọc
          tiếp theo.
        </p>
      </div>
      <div className="grid w-full gap-4 lg:grid-cols-3">
        {location.map((item) => (
          <ProvinceBtn
            key={item.id}
            code={item.code}
            image={item.image}
            name={item.name}
          />
        ))}
      </div>
    </section>
  );
};

export default Province;
