import React, { memo, useEffect, useState } from "react";
import icons from "../ultils/icons";
import { getNumbersArea, getNumbersPrice } from "../ultils/Common/getNumbers";

const { GrLinkPrevious } = icons;

const Modal = ({
  setIsShowModal,
  content,
  name,
  handleSubmit,
  queries,
  arrMinMax,
  defaultText,
}) => {
  const [persent1, setPersent1] = useState(
    name === "price" && arrMinMax?.priceArr
      ? arrMinMax.priceArr[0]
      : name === "area" && arrMinMax?.areaArr
        ? arrMinMax.areaArr[0]
        : 0,
  );
  const [persent2, setPersent2] = useState(
    name === "price" && arrMinMax?.priceArr
      ? arrMinMax.priceArr[1]
      : name === "area" && arrMinMax?.areaArr
        ? arrMinMax.areaArr[1]
        : 100,
  );
  const [activedEl, setActivedEl] = useState("");

  useEffect(() => {
    const activeTrackElement = document.getElementById("track-active");

    if (!activeTrackElement) return;

    if (persent2 <= persent1) {
      activeTrackElement.style.left = `${persent2}%`;
      activeTrackElement.style.right = `${100 - persent1}%`;
      return;
    }

    activeTrackElement.style.left = `${persent1}%`;
    activeTrackElement.style.right = `${100 - persent2}%`;
  }, [persent1, persent2]);

  const handleClickTrack = (event, value) => {
    const trackElement = document.getElementById("track");
    const trackRect = trackElement.getBoundingClientRect();
    const percent = value ?? Math.round(((event.clientX - trackRect.left) * 100) / trackRect.width);

    if (Math.abs(percent - persent1) <= Math.abs(percent - persent2)) {
      setPersent1(percent);
      return;
    }

    setPersent2(percent);
  };

  const convert100toTarget = (percent) =>
    name === "price"
      ? (Math.ceil(Math.round(percent * 1.5) / 5) * 5) / 10
      : name === "area"
        ? Math.ceil(Math.round(percent * 0.9) / 5) * 5
        : 0;

  const convertto100 = (percent) => {
    const target = name === "price" ? 15 : name === "area" ? 90 : 1;
    return Math.floor((percent / target) * 100);
  };

  const handleActive = (code, value) => {
    setActivedEl(code);
    const values = name === "price" ? getNumbersPrice(value) : getNumbersArea(value);

    if (values.length === 1) {
      if (values[0] === 1 || values[0] === 20) {
        setPersent1(0);
        setPersent2(convertto100(values[0]));
      }

      if (values[0] === 15 || values[0] === 90) {
        setPersent1(100);
        setPersent2(100);
      }
    }

    if (values.length === 2) {
      setPersent1(convertto100(values[0]));
      setPersent2(convertto100(values[1]));
    }
  };

  const handleBeforeSubmit = (event) => {
    const min = persent1 <= persent2 ? persent1 : persent2;
    const max = persent1 <= persent2 ? persent2 : persent1;
    const values = [convert100toTarget(min), convert100toTarget(max)];

    handleSubmit(
      event,
      {
        [`${name}Number`]: values,
        [name]: `Từ ${convert100toTarget(min)} - ${convert100toTarget(max)} ${
          name === "price" ? "triệu" : "m2"
        }`,
      },
      {
        [`${name}Arr`]: [min, max],
      },
    );
  };

  return (
    <div
      onClick={() => setIsShowModal(false)}
      className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/70 px-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative h-[520px] w-full max-w-[720px] overflow-hidden rounded-[32px] bg-white"
      >
        <div className="flex h-[60px] items-center border-b border-slate-200 px-5">
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-slate-100"
            onClick={() => setIsShowModal(false)}
          >
            <GrLinkPrevious size={22} />
          </button>
        </div>

        {(name === "category" || name === "province") && (
          <div className="flex h-[calc(100%-60px)] flex-col overflow-y-auto p-5">
            <label className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm text-slate-700">
              <input
                type="radio"
                name={name}
                value={defaultText || ""}
                id="default"
                checked={!queries[`${name}Code`]}
                onChange={(event) =>
                  handleSubmit(event, { [name]: defaultText, [`${name}Code`]: null })
                }
              />
              <span>{defaultText}</span>
            </label>
            {content?.map((item) => (
              <label
                key={item.code}
                className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name={name}
                  id={item.code}
                  value={item.code}
                  checked={item.code === queries[`${name}Code`]}
                  onChange={(event) =>
                    handleSubmit(event, {
                      [name]: item.value,
                      [`${name}Code`]: item.code,
                    })
                  }
                />
                <span>{item.value}</span>
              </label>
            ))}
          </div>
        )}

        {(name === "price" || name === "area") && (
          <div className="flex h-[calc(100%-60px)] flex-col justify-between p-6 lg:p-10">
            <div className="space-y-10">
              <div className="relative flex flex-col items-center justify-center">
                <div className="absolute top-[-48px] z-30 text-xl font-bold text-amber-600">
                  {persent1 === 100 && persent2 === 100
                    ? `Trên ${convert100toTarget(persent1)} ${
                        name === "price" ? "triệu" : "m2"
                      } +`
                    : `Từ ${
                        persent1 <= persent2
                          ? convert100toTarget(persent1)
                          : convert100toTarget(persent2)
                      } - ${
                        persent2 >= persent1
                          ? convert100toTarget(persent2)
                          : convert100toTarget(persent1)
                      } ${name === "price" ? "triệu" : "m2"}`}
                </div>
                <div
                  onClick={handleClickTrack}
                  id="track"
                  className="absolute top-0 bottom-0 h-[5px] w-full rounded-full bg-slate-200"
                />
                <div
                  onClick={handleClickTrack}
                  id="track-active"
                  className="absolute top-0 bottom-0 h-[5px] rounded-full bg-amber-500"
                />
                <input
                  max="100"
                  min="0"
                  step="1"
                  type="range"
                  value={persent1}
                  className="absolute top-0 bottom-0 w-full appearance-none pointer-events-none"
                  onChange={(event) => {
                    setPersent1(+event.target.value);
                    if (activedEl) setActivedEl("");
                  }}
                />
                <input
                  max="100"
                  min="0"
                  step="1"
                  type="range"
                  value={persent2}
                  className="absolute top-0 bottom-0 w-full appearance-none pointer-events-none"
                  onChange={(event) => {
                    setPersent2(+event.target.value);
                    if (activedEl) setActivedEl("");
                  }}
                />
                <div className="absolute left-0 right-0 top-6 z-30 flex items-center justify-between text-sm text-slate-500">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClickTrack(event, 0);
                    }}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClickTrack(event, 100);
                    }}
                  >
                    {name === "price" ? "15 triệu +" : "Trên 90 m2"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Chọn nhanh</h4>
                <div className="flex flex-wrap gap-2">
                  {content?.map((item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => handleActive(item.code, item.value)}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        item.code === activedEl
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      {item.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
              onClick={handleBeforeSubmit}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Modal);
