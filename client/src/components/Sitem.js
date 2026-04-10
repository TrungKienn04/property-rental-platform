import React, { memo } from "react";
import moment from "moment";
import "moment/locale/vi";
import { Link } from "react-router-dom";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";

const { getPrimaryImage } = require("../ultils/Common/postHelpers");

const Sitem = ({ id, title, price, image, createdAt }) => {
  const placeholder = "/placeholder.svg";
  const safeImage = getPrimaryImage(image, placeholder);
  const detailPath = `/chi-tiet/${formatVietnameseToString(title)}/${id}`;

  return (
    <Link
      to={detailPath}
      className="group flex w-full items-center gap-3 rounded-[22px] border border-slate-100 bg-white/90 px-3 py-3 transition hover:-translate-y-0.5 hover:border-amber-100 hover:bg-amber-50/70"
    >
      <img
        src={safeImage}
        alt={title}
        className="h-[76px] w-[76px] flex-none rounded-[20px] object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholder;
        }}
      />
      <div className="flex w-full flex-auto flex-col justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-slate-800 transition group-hover:text-amber-700">
          {title}
        </h4>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-emerald-600">{price}</span>
          <span className="text-xs font-medium text-slate-400">
            {moment(createdAt).fromNow()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default memo(Sitem);
