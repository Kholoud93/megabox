import React from "react";
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationTriangle, HiShare } from "react-icons/hi2";
import "../App.css"

// Icon components for each toast type
const ToastIcons = {
  success: <HiCheckCircle className="toast-icon toast-icon-success" />,
  error: <HiXCircle className="toast-icon toast-icon-error" />,
  info: <HiInformationCircle className="toast-icon toast-icon-info" />,
  warning: <HiExclamationTriangle className="toast-icon toast-icon-warning" />,
  share: <HiShare className="toast-icon toast-icon-share" />,
  default: <HiInformationCircle className="toast-icon toast-icon-default" />
};

export const ToastOptions = (Type) => {
  const icon = ToastIcons[Type] || ToastIcons.default;

  if (Type === "success") {
    return {
      theme: "colored",
      className: "ToastSuccess",
      icon: icon
    }
  } else if (Type === "error") {
    return {
      theme: "colored",
      className: "ToastError",
      icon: icon
    }
  } else if (Type === "info") {
    return {
      theme: "colored",
      className: "ToastInfo",
      icon: icon
    }
  } else if (Type === "warning") {
    return {
      theme: "colored",
      className: "ToastWarning",
      icon: icon
    }
  } else if (Type === "share") {
    return {
      theme: "colored",
      className: "ToastShare",
      position: "bottom-center",
      icon: icon
    };
  }
  
  // Default fallback
  return {
    theme: "colored",
    className: "ToastDefault",
    icon: icon
  };
}