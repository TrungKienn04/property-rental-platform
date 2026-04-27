import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loading } from "./";
import { apiUploadImages } from "../services";
import {
  fetchVietnamDistricts,
  fetchVietnamProvinces,
} from "../services/location";
import { path } from "../ultils/constant";
import icons from "../ultils/icons";
import { buildFullAddress } from "../ultils/Common/systemPost";
import GoogleAddressMap from "./GoogleAddressMap";

const { BsCameraFill, ImBin } = icons;

const targets = ["Tất cả", "Nam", "Nữ"];

const errorFieldOrder = [
  "categoryCode",
  "title",
  "priceNumber",
  "areaNumber",
  "description",
  "province",
  "district",
  "exactAddress",
  "address",
  "images",
];

const sectionClass =
  "surface-card rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:px-5 lg:py-5";
const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900";
const selectClass = `${inputClass} pr-10`;
const labelClass = "mb-2 block text-sm font-semibold text-slate-800";
const secondaryButtonClass =
  "inline-flex min-h-[46px] w-full items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-5 text-sm font-semibold leading-none text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto";
const primaryButtonClass =
  "inline-flex min-h-[46px] w-full items-center justify-center whitespace-nowrap rounded-md bg-slate-700 px-6 text-sm font-semibold leading-none text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition duration-200 hover:bg-slate-800 hover:shadow-[0_14px_28px_rgba(15,23,42,0.16)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[240px]";

const FieldHint = ({ error }) => {
  if (!error) return null;

  return <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>;
};

const SectionHeader = ({ eyebrow, title, action }) => (
  <div className="mb-4 flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
    </div>
    {action ? <div className="flex items-center">{action}</div> : null}
  </div>
);

const ContactCard = ({ label, value, muted = false }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
      {label}
    </p>
    <p
      className={`mt-2 break-words text-sm font-semibold ${
        muted ? "text-slate-400" : "text-slate-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const ActionButtons = ({
  showCancel,
  onCancel,
  onSubmitClick,
  isSubmitting,
  isUploading,
  submitLabel,
}) => (
  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
    {showCancel ? (
      <button type="button" onClick={onCancel} className={secondaryButtonClass}>
        Hủy chỉnh sửa
      </button>
    ) : null}
    <button
      type="button"
      onClick={onSubmitClick}
      disabled={isSubmitting || isUploading}
      className={primaryButtonClass}
    >
      {isUploading
        ? "Đang tải ảnh..."
        : isSubmitting
          ? "Đang xử lý..."
          : submitLabel}
    </button>
  </div>
);

const SystemPostForm = ({
  value,
  setValue,
  errors = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = "Lưu thay đổi",
  onCancel,
  showCancel = false,
}) => {
  const { categories } = useSelector((state) => state.app);
  const { currentData } = useSelector((state) => state.user);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [isProvinceLoading, setIsProvinceLoading] = useState(false);
  const [isDistrictLoading, setIsDistrictLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadQueue, setUploadQueue] = useState([]);
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState("");
  const fieldRefs = useRef({});
  const pendingPreviewUrlsRef = useRef(new Set());

  const derivedAddress = useMemo(() => buildFullAddress(value), [value]);
  const isUploading = uploadQueue.length > 0;
  const errorCount = Object.keys(errors || {}).length;

  useEffect(() => {
    let isMounted = true;
    const pendingPreviewUrls = pendingPreviewUrlsRef.current;

    const loadProvinces = async () => {
      setIsProvinceLoading(true);

      try {
        const results = await fetchVietnamProvinces();
        if (isMounted) {
          setProvinces(results);
        }
      } catch (error) {
        if (isMounted) {
          setProvinces([]);
        }
      } finally {
        if (isMounted) {
          setIsProvinceLoading(false);
        }
      }
    };

    loadProvinces();

    return () => {
      isMounted = false;
      pendingPreviewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      pendingPreviewUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (!provinces.length) return;

    const matchedProvince = provinces.find(
      (item) =>
        item?.province_code === value?.provinceCode ||
        item?.province_name === value?.province,
    );

    setProvinceCode(matchedProvince?.province_id || "");
  }, [provinces, value?.province, value?.provinceCode]);

  useEffect(() => {
    let isMounted = true;

    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      return undefined;
    }

    const loadDistricts = async () => {
      setIsDistrictLoading(true);

      try {
        const results = await fetchVietnamDistricts(provinceCode);
        if (isMounted) {
          setDistricts(results);
        }
      } catch (error) {
        if (isMounted) {
          setDistricts([]);
        }
      } finally {
        if (isMounted) {
          setIsDistrictLoading(false);
        }
      }
    };

    loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [provinceCode]);

  useEffect(() => {
    if (!districts.length) return;

    const matchedDistrict = districts.find(
      (item) => item?.district_name === value?.district,
    );

    setDistrictCode(matchedDistrict?.district_id || "");
  }, [districts, value?.district]);

  useEffect(() => {
    if (value.address !== derivedAddress) {
      setValue((prev) => ({
        ...prev,
        address: derivedAddress,
      }));
    }
  }, [derivedAddress, setValue, value.address]);

  useEffect(() => {
    if (!hasSubmitAttempted) return;

    const firstErrorField = errorFieldOrder.find(
      (fieldName) => errors?.[fieldName],
    );

    if (!firstErrorField) {
      setSubmitFeedback("");
      return;
    }

    const targetNode = fieldRefs.current[firstErrorField];

    setSubmitFeedback(
      errorCount === 1
        ? "Còn 1 mục chưa hoàn thiện. Hệ thống đã đưa bạn tới điểm cần sửa."
        : `Còn ${errorCount} mục chưa hoàn thiện. Hệ thống đã đưa bạn tới lỗi đầu tiên.`,
    );

    if (!targetNode) return;

    targetNode.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (typeof targetNode.focus === "function") {
      try {
        targetNode.focus({ preventScroll: true });
      } catch (error) {
        targetNode.focus();
      }
    }
  }, [errorCount, errors, hasSubmitAttempted]);

  const registerFieldRef =
    (...fieldNames) =>
    (node) => {
      fieldNames.forEach((fieldName) => {
        if (!fieldName) return;

        if (node) {
          fieldRefs.current[fieldName] = node;
          return;
        }

        delete fieldRefs.current[fieldName];
      });
    };

  const clearSubmitFeedback = () => {
    if (submitFeedback) {
      setSubmitFeedback("");
    }
  };

  const handleSubmitIntent = () => {
    setHasSubmitAttempted(true);
    clearSubmitFeedback();
    onSubmit?.();
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSubmitIntent();
  };

  const patchAddress = (patch) => {
    setValue((prev) => {
      const nextValue = {
        ...prev,
        ...patch,
      };

      return {
        ...nextValue,
        address: buildFullAddress(nextValue),
      };
    });
  };

  const handleTextChange = (event) => {
    const { name, value: nextValue } = event.target;
    clearSubmitFeedback();

    if (name === "exactAddress") {
      patchAddress({ exactAddress: nextValue });
      return;
    }

    setValue((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleProvinceChange = (event) => {
    const nextProvinceId = event.target.value;
    const selectedProvince = provinces.find(
      (item) => item?.province_id === nextProvinceId,
    );

    clearSubmitFeedback();
    setProvinceCode(nextProvinceId);
    setDistrictCode("");
    setDistricts([]);
    patchAddress({
      provinceCode: selectedProvince?.province_code || "",
      province: selectedProvince?.province_name || "",
      district: "",
    });
  };

  const handleDistrictChange = (event) => {
    const nextDistrictId = event.target.value;
    const selectedDistrict = districts.find(
      (item) => item?.district_id === nextDistrictId,
    );

    clearSubmitFeedback();
    setDistrictCode(nextDistrictId);
    patchAddress({
      district: selectedDistrict?.district_name || "",
    });
  };

  const handleUploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    clearSubmitFeedback();
    setUploadError("");

    if (!files.length) return;

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setUploadError("Chỉ chấp nhận ảnh và mỗi ảnh không vượt quá 5MB.");
      return;
    }

    const pendingImages = files.map((file) => {
      const preview = URL.createObjectURL(file);
      pendingPreviewUrlsRef.current.add(preview);

      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        preview,
      };
    });

    setUploadQueue((prev) => [...prev, ...pendingImages]);

    try {
      const uploadResults = await Promise.allSettled(
        files.map((file) => {
          const formData = new FormData();
          formData.append("file", file);

          if (process.env.REACT_APP_UPLOAD_ASSETS_NAME) {
            formData.append(
              "upload_preset",
              process.env.REACT_APP_UPLOAD_ASSETS_NAME,
            );
          }

          return apiUploadImages(formData);
        }),
      );

      const nextImages = uploadResults
        .filter((item) => item.status === "fulfilled")
        .map((item) => item.value?.data?.secure_url)
        .filter(Boolean);

      if (nextImages.length) {
        setValue((prev) => ({
          ...prev,
          images: [
            ...(Array.isArray(prev.images) ? prev.images : []),
            ...nextImages,
          ],
        }));
      }

      if (nextImages.length !== files.length) {
        const firstUploadError = uploadResults
          .filter((item) => item.status === "rejected")
          .map(
            (item) => item.reason?.response?.data?.msg || item.reason?.message,
          )
          .filter(Boolean)[0];

        setUploadError(
          firstUploadError ||
            "Một số ảnh chưa tải lên được. Vui lòng kiểm tra và thử lại.",
        );
      }
    } catch (error) {
      setUploadError(
        error?.response?.data?.msg ||
          "Không thể tải ảnh lên. Vui lòng thử lại.",
      );
    } finally {
      setUploadQueue((prev) =>
        prev.filter(
          (item) =>
            !pendingImages.some((pendingItem) => pendingItem.id === item.id),
        ),
      );

      pendingImages.forEach((item) => {
        URL.revokeObjectURL(item.preview);
        pendingPreviewUrlsRef.current.delete(item.preview);
      });
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    clearSubmitFeedback();
    setValue((prev) => ({
      ...prev,
      images: (Array.isArray(prev.images) ? prev.images : []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  return (
    <form className="space-y-4 lg:space-y-5" onSubmit={handleFormSubmit}>
      <section className={sectionClass}>
        <SectionHeader eyebrow="Nội dung" title="Thông tin bài đăng" />

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="categoryCode">
              Danh mục cho thuê
            </label>
            <select
              id="categoryCode"
              name="categoryCode"
              value={value.categoryCode}
              onChange={handleTextChange}
              ref={registerFieldRef("categoryCode")}
              className={selectClass}
            >
              <option value="">Chọn danh mục</option>
              {categories?.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.value}
                </option>
              ))}
            </select>
            <FieldHint error={errors.categoryCode} />
          </div>

          <div>
            <label className={labelClass} htmlFor="target">
              Đối tượng cho thuê
            </label>
            <select
              id="target"
              name="target"
              value={value.target}
              onChange={handleTextChange}
              className={selectClass}
            >
              {targets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="title">
            Tiêu đề
          </label>
          <input
            id="title"
            name="title"
            value={value.title}
            onChange={handleTextChange}
            ref={registerFieldRef("title")}
            className={inputClass}
            placeholder="Ví dụ: Phòng full nội thất gần đại học, giờ giấc tự do"
          />
          <FieldHint error={errors.title} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="priceNumber">
              Giá cho thuê
            </label>
            <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white">
              <input
                id="priceNumber"
                name="priceNumber"
                value={value.priceNumber}
                onChange={handleTextChange}
                ref={registerFieldRef("priceNumber")}
                className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="3500000"
                inputMode="numeric"
              />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                đồng
              </span>
            </div>
            <FieldHint error={errors.priceNumber} />
          </div>

          <div>
            <label className={labelClass} htmlFor="areaNumber">
              Diện tích
            </label>
            <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white">
              <input
                id="areaNumber"
                name="areaNumber"
                value={value.areaNumber}
                onChange={handleTextChange}
                ref={registerFieldRef("areaNumber")}
                className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="25"
                inputMode="decimal"
              />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                m²
              </span>
            </div>
            <FieldHint error={errors.areaNumber} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="description">
            Nội dung mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={value.description}
            onChange={handleTextChange}
            ref={registerFieldRef("description")}
            rows={8}
            className={`${inputClass} resize-y`}
            placeholder="Mô tả tiện nghi, nội thất, giờ giấc, chi phí phụ và các thông tin quan trọng khác."
          />
          <FieldHint error={errors.description} />
        </div>
      </section>

      <section className={sectionClass}>
        <SectionHeader eyebrow="Vị trí" title="Địa chỉ và bản đồ" />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="province">
                  Tỉnh/Thành phố
                </label>
                <select
                  id="province"
                  value={provinceCode}
                  onChange={handleProvinceChange}
                  ref={registerFieldRef("province")}
                  className={selectClass}
                  disabled={isProvinceLoading}
                >
                  <option value="">
                    {isProvinceLoading
                      ? "Đang tải danh sách..."
                      : "Chọn tỉnh/thành phố"}
                  </option>
                  {provinces.map((item) => (
                    <option key={item.province_id} value={item.province_id}>
                      {item.province_name}
                    </option>
                  ))}
                </select>
                <FieldHint error={errors.province} />
              </div>

              <div>
                <label className={labelClass} htmlFor="district">
                  Quận/Huyện
                </label>
                <select
                  id="district"
                  value={districtCode}
                  onChange={handleDistrictChange}
                  ref={registerFieldRef("district")}
                  className={selectClass}
                  disabled={!provinceCode || isDistrictLoading}
                >
                  <option value="">
                    {isDistrictLoading
                      ? "Đang tải quận/huyện..."
                      : provinceCode
                        ? "Chọn quận/huyện"
                        : "Chọn tỉnh/thành trước"}
                  </option>
                  {districts.map((item) => (
                    <option key={item.district_id} value={item.district_id}>
                      {item.district_name}
                    </option>
                  ))}
                </select>
                <FieldHint error={errors.district} />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="exactAddress">
                Địa chỉ chi tiết
              </label>
              <input
                id="exactAddress"
                name="exactAddress"
                value={value.exactAddress}
                onChange={handleTextChange}
                ref={registerFieldRef("exactAddress", "address")}
                className={inputClass}
                placeholder="Số nhà, tên đường, tòa nhà, tầng hoặc mốc dễ tìm"
              />
              <FieldHint error={errors.exactAddress} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Địa chỉ hiển thị
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {derivedAddress || "Chưa đủ thông tin địa chỉ"}
              </p>
              <FieldHint error={errors.address} />
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4">
              <p className="text-sm font-semibold text-slate-950">
                Google Maps
              </p>
            </div>
            <div className="h-[320px]">
              <GoogleAddressMap
                address={derivedAddress}
                emptyMessage="Chọn tỉnh, quận/huyện và nhập địa chỉ chi tiết để xem trước vị trí."
              />
            </div>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionHeader eyebrow="Media" title="Hình ảnh" />

        <label
          htmlFor="upload-image"
          ref={registerFieldRef("images")}
          tabIndex={-1}
          className="flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[18px] border border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-slate-400 hover:bg-slate-100"
        >
          {isUploading ? (
            <Loading />
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-900 text-white">
                <BsCameraFill size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-950">
                  Chọn ảnh từ thiết bị
                </p>
                <p className="text-sm text-slate-500">
                  Tối đa 5MB cho mỗi ảnh.
                </p>
              </div>
            </>
          )}
        </label>

        <input
          id="upload-image"
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleUploadImages}
        />

        <FieldHint error={errors.images || uploadError} />

        {(uploadQueue.length > 0 || value.images?.length > 0) && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[16px] border border-dashed border-slate-300 bg-slate-50"
              >
                <div className="relative">
                  <img
                    src={item.preview}
                    alt={item.name}
                    className="h-48 w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35">
                    <span className="rounded-md bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700">
                      Đang tải lên...
                    </span>
                  </div>
                </div>
                <p className="truncate px-4 py-3 text-xs text-slate-500">
                  {item.name}
                </p>
              </div>
            ))}

            {(Array.isArray(value.images) ? value.images : []).map(
              (item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="group relative overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50"
                >
                  <img
                    src={item}
                    alt={`preview-${index}`}
                    className="h-48 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950/82 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label="Xóa ảnh"
                  >
                    <ImBin />
                  </button>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <section className={sectionClass}>
        <SectionHeader
          eyebrow="Liên hệ"
          title="Thông tin liên hệ"
          action={
            <Link
              to={`/he-thong/${path.EDIT_PROFILE}`}
              className={secondaryButtonClass}
            >
              Chỉnh hồ sơ liên hệ
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ContactCard
            label="Tên liên hệ"
            value={currentData?.name || "Chưa cập nhật"}
            muted={!currentData?.name}
          />
          <ContactCard
            label="Số điện thoại"
            value={currentData?.phone || "Chưa cập nhật"}
            muted={!currentData?.phone}
          />
          <ContactCard
            label="Zalo"
            value={currentData?.zalo || currentData?.phone || "Chưa cập nhật"}
            muted={!currentData?.zalo && !currentData?.phone}
          />
          <ContactCard
            label="Gmail"
            value={currentData?.email || "Chưa cập nhật"}
            muted={!currentData?.email}
          />
        </div>
      </section>

      {submitFeedback ? (
        <p className="text-sm font-medium text-rose-600">{submitFeedback}</p>
      ) : null}

      <div className="flex justify-end">
        <ActionButtons
          showCancel={showCancel}
          onCancel={onCancel}
          onSubmitClick={handleSubmitIntent}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          submitLabel={submitLabel}
        />
      </div>
    </form>
  );
};

export default SystemPostForm;
