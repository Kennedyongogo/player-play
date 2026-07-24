import Swal from "sweetalert2";

const theme = {
  background: "#111827",
  color: "#F8FAFC",
  confirmButtonColor: "#7C3AED",
  cancelButtonColor: "#475569",
};

/** Success feedback (SweetAlert2). */
export function showSuccess(title, text = "") {
  return Swal.fire({
    icon: "success",
    title,
    text: text || undefined,
    timer: 2400,
    timerProgressBar: true,
    ...theme,
  });
}

/** Error feedback. */
export function showError(title, text = "") {
  return Swal.fire({
    icon: "error",
    title,
    text: text || undefined,
    ...theme,
  });
}

/** Info feedback. */
export function showInfo(title, text = "") {
  return Swal.fire({
    icon: "info",
    title,
    text: text || undefined,
    ...theme,
  });
}

/** Confirm dialog — resolves true if confirmed. */
export async function showConfirm(title, text = "", confirmText = "Confirm") {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: text || undefined,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    ...theme,
  });
  return result.isConfirmed;
}

export { Swal };
