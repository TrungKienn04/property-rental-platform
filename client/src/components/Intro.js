import React, { memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../components";
import icons from "../ultils/icons";
import { path } from "../ultils/constant";
import { text } from "../ultils/dataIntro";
import { formatVietnameseToString } from "../ultils/Common/formatVietnameseToString";

const { isAdminRole } = require("../ultils/Common/authHelpers");

const { GrStar } = icons;

const Intro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useSelector((state) => state.app);
  const { isLoggedIn, role: storedRole } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);
  const resolvedRole = currentData?.role || storedRole;
  const isAdmin = isAdminRole(resolvedRole);

  const handlePrimaryAction = () => {
    if (isAdmin) {
      navigate(`/he-thong/${path.ADMIN_MANAGE_POSTS}`);
      return;
    }

    if (isLoggedIn) {
      navigate(`/he-thong/${path.CREATE_POST}`);
      return;
    }

    navigate(`/${path.LOGIN}`, {
      state: {
        flag: false,
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <section className="rounded-[32px] bg-white p-6 shadow-sm lg:p-8">
      <div className="space-y-6 text-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
            Giá trị cốt lõi
          </p>
          <h3 className="text-3xl font-semibold text-slate-900">{text.title}</h3>
          <p className="mx-auto max-w-4xl text-base leading-8 text-slate-500">
            {text.description}{" "}
            {categories?.map((item, index) => (
              <Link
                to={`/${formatVietnameseToString(item.value)}`}
                key={item.code}
                className="font-medium text-amber-600 transition hover:text-amber-500"
              >
                {`${item.value.toLowerCase()}${index < categories.length - 1 ? ", " : ""}`}
              </Link>
            ))}
            {text.description2}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {text.statistic.map((item) => (
            <div
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              key={item.name}
            >
              <h4 className="text-2xl font-semibold text-slate-900">{item.value}</h4>
              <p className="mt-2 text-sm text-slate-500">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">{text.price}</h3>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <GrStar key={index} size={24} color="#f59e0b" />
            ))}
          </div>
          <p className="mx-auto max-w-3xl text-base italic leading-8 text-slate-500">
            {text.comment}
          </p>
          <span className="block text-sm font-medium text-slate-700">{text.author}</span>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-slate-900">{text.question}</h3>
          <p className="text-base leading-8 text-slate-500">{text.answer}</p>
          <Button
            text={isAdmin ? "Vào kiểm duyệt bài" : "Đăng tin ngay"}
            bgColor="bg-amber-400"
            textColor="text-slate-950"
            px="px-6"
            onClick={handlePrimaryAction}
          />
        </div>
      </div>
    </section>
  );
};

export default memo(Intro);
