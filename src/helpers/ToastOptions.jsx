import "../App.css"
export const ToastOptions = (Type) => {

  if (Type === "success") {

    return {
      theme: "colored",
      className: "Toast"
    }
  } else if (Type === "error") {
    return {
      theme: "colored",
      className: "ToastError"
    }
  }
  else if (Type === "share") {
    return {
      theme: "colored",
      className: "ToastShare",
      position: "bottom-center",
    };
  }
}