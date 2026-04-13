import React from "react";
import { ProvinceBtn } from "./index";
import { location } from "../ultils/constant";

const Province = () => {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
          Khu vực nổi bật:
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
