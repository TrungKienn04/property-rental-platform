import React from "react";
import { useSelector } from "react-redux";
import List from "../containers/Public/List";
import Pagination from "../containers/Public/Pagination";
import ItemSidebar from "./ItemSidebar";
import Province from "./Province";
import RelatedPost from "./RelatedPost";

const ListingLayout = ({
  title,
  description,
  categoryCode,
  showProvince = false,
  showCategorySidebar = false,
}) => {
  const { categories, prices, areas } = useSelector((state) => state.app);

  return (
    <div className="w-full space-y-6">
      <div className="px-0 py-0 lg:px-0 lg:py-0">
        <div className="max-w-6xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            TroMoi
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
            {title}
          </h1>
          <p className="text-base leading-8 text-slate-500">{description}</p>
        </div>
      </div>

      {showProvince && <Province />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_328px]">
        <div className="space-y-5">
          <List categoryCode={categoryCode} />
          <Pagination />
        </div>
        <aside className="space-y-5">
          {showCategorySidebar && (
            <ItemSidebar content={categories} title="Danh mục cho thuê" />
          )}
          <ItemSidebar
            isDouble
            type="priceCode"
            content={prices}
            title="Xem theo giá"
          />
          <ItemSidebar
            isDouble
            type="areaCode"
            content={areas}
            title="Xem theo diện tích"
          />
          <RelatedPost />
        </aside>
      </div>
    </div>
  );
};

export default ListingLayout;
