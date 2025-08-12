import Swal from 'sweetalert2';

export const showSuccessAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#880088',
  });
};

export const showErrorAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#880088',
  });
};

export const showConfirmationAlert = async (
  title: string,
  text: string,
  icon: 'warning' | 'error' | 'success' | 'info' = 'warning',
  showCancelButton = true
) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  });
};