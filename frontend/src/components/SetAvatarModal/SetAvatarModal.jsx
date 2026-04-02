import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAvatar } from "../../store/userSlice";

import "./SetAvatarModal.css";

const SetAvatarModal = ({ closeModalHandler }) => {
  const storeDispatch = useDispatch();
  const [avatars, setAvatars] = useState([
    {
      name: "avatar1",
      fileName: "/avatar1.png",
    },
    {
      name: "avatar2",
      fileName: "/avatar2.png",
    },
    {
      name: "avatar3",
      fileName: "/avatar3.png",
    },
    {
      name: "avatar4",
      fileName: "/avatar4.png",
    },
    {
      name: "avatar5",
      fileName: "/avatar5.png",
    },
    {
      name: "avatar6",
      fileName: "/avatar6.png",
    },
    {
      name: "avatar7",
      fileName: "/avatar7.png",
    },
    {
      name: "avatar8",
      fileName: "/avatar8.png",
    },
    {
      name: "avatar9",
      fileName: "/avatar9.png",
    },
    {
      name: "avatar10",
      fileName: "/avatar10.png",
    },
  ]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");
    async function fetchPurchasedAvatars() {
      const res = fetch(
        `${import.meta.env.VITE_API_URL}/api/users/getPurchasedAvatars`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal,
        },
      )
        .then((r) => {
          if (!r.ok) throw new Error("error!");
          return r.json();
        })
        .then((d) => {
          const mapped = d.data.map((item) => ({
            name: item.img_name,
            fileName: `/${item.img_name}.png`,
          }));
          setAvatars((prev) => [...prev, ...mapped]);
        })
        .catch((e) => {});
      return res;
    }
    fetchPurchasedAvatars();
    return () => {
      controller.abort();
    };
  }, []);

  const handleAvatarChange = async (avatar) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");
    console.log(avatar.name);
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/setNewAvatar/${avatar.name}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal,
      },
    )
      .then((r) => {
        if (!r.ok) throw new Error("error!");
        return r.json();
      })
      .then(() => {
        storeDispatch(
          updateAvatar({
            avatar: avatar.fileName,
          }),
        );
      })
      .catch((e) => {
        console.error(e);
      });
  };
  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-btn-container">
          <button onClick={closeModalHandler}>X</button>
        </div>
        <h3>Dostępne avatary</h3>
        <div className="set-avatar-modal-grid">
          {avatars.map((avatar) => (
            <div
              onClick={() => {
                handleAvatarChange(avatar);
              }}
            >
              <img src={avatar.fileName} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SetAvatarModal;
