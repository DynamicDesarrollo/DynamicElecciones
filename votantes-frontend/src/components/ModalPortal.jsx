import ReactDOM from "react-dom";

export default function ModalPortal({ children }) {
  if (typeof window === "undefined") return null;
  return ReactDOM.createPortal(
    children,
    document.body
  );
}
