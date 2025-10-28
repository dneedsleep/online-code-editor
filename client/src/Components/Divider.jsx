import Edit from "./Editor.jsx";


export default function Divide() {
    return (
        <div className="flex w-full h-screen items-stretch p-5">
            <div className="card bg-base-300 rounded-box grid grow place-items-center">Content</div>
            <div className="divider divider-horizontal m-0 self-stretch"></div>
            <div className="card bg-base-300 rounded-box grid grow-3 ">
                    <Edit/>
            </div>
        </div>

    )
}