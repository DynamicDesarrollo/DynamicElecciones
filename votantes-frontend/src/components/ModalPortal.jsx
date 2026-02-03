import { createPortal } from "react-dom";

export default function ModalPortal({ children, onClose }) {
  if (typeof window === "undefined") return null;
  const handleClose = (e) => {
    // Limpieza forzada de clases y backdrops
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    }, 200);
    if (onClose) {
      onClose(e);
    }
  };
  return createPortal(
    <div style={{position:'fixed', inset:0, zIndex: 99999}}>
      <div style={{position:'absolute', inset:0, background:'#212529', opacity:0.92, width:'100%', height:'100%'}} onClick={handleClose}></div>
      <div className="d-flex align-items-center justify-content-center h-100 w-100" style={{minHeight:'100vh', position:'relative'}}>
        <div className="modal-dialog modal-dialog-centered" style={{maxWidth:'500px', width:'100%', zIndex:100000}}>
          <div className="modal-content p-0 position-relative" style={{background:'#fff', borderRadius:'1rem', border:'1px solid #dee2e6', boxShadow:'0 0.5rem 1rem rgba(0,0,0,.15)'}} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="btn-close position-absolute end-0 top-0 m-3"
              aria-label="Cerrar"
              onClick={handleClose}
            ></button>
            <div className="modal-body p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
