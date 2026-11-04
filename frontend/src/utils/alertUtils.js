import Swal from 'sweetalert2'

export const showAlert = (title, text, icon = 'success') => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ea580c',
    background: '#ffffff',
    color: '#102a20'
  })
}

export const confirmAction = (title, text, confirmText = 'Yes, continue') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ea580c',
    cancelButtonColor: '#64748b',
    background: '#ffffff',
    color: '#102a20',
    reverseButtons: true
  })
}
