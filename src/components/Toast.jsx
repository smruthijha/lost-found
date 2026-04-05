import styles from "../styles/Toast.module.css";

function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className={styles.toast}>
      <span>{toast.type === "error" ? "❌" : "✅"}</span>
      {toast.msg}
    </div>
  );
}

export default Toast;