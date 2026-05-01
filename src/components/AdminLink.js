import Link from "next/link";

export default function AdminLink() {
    return (
        <Link href="/admin" className="admin-link-btn" title="Admin Portal">
            <i className="fa-solid fa-lock"></i>
        </Link>
    );
}
