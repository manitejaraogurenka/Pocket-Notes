import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import { CustomAvatar } from "./miscellaneous/Avatar";
import Topbar from "./miscellaneous/Topbar";
import { groupActions } from "../store/group-slice";
import useDataFetch from "../helper/dataFetch";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Toaster, toast } from "react-hot-toast";

const avatarColors = {
  red: { top: "#FF845E", bottom: "#D45246" },
  orange: { top: "#FEBB5B", bottom: "#F68136" },
  violet: { top: "#B694F9", bottom: "#6C61DF" },
  green: { top: "#9AD164", bottom: "#46BA43" },
  cyan: { top: "#53edd6", bottom: "#28c9b7" },
  blue: { top: "#5CAFFA", bottom: "#408ACF" },
  pink: { top: "#FF8AAC", bottom: "#D95574" },
  archive: { top: "#B8C2CC", bottom: "#9EAAB5" },
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { selectedGroup, searchResult } = useSelector((state) => state.group);
  const [groupsList, setGroupsList] = useState([]);
  const { isdark } = useSelector((state) => state.lightDark);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupColor, setGroupColor] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const loader = useRef(null);

  const { loading, error, data } = useDataFetch(
    `https://pocketnotesappapi.vercel.app/api/groups?page=${page}&limit=10`
  );

  useEffect(() => {
    if (data) {
      const { data: groupsData, totalPages } = data;

      if (Array.isArray(groupsData) && groupsData.length > 0) {
        setGroupsList((prevGroups) => {
          const newGroups = groupsData.filter(
            (group) => !prevGroups.some((g) => g._id === group._id)
          );

          return [...prevGroups, ...newGroups];
        });
      }

      setHasMore(page < totalPages);
    }
  }, [data, page]);

  useEffect(() => {
    const handleObserver = (entities) => {
      const target = entities[0];
      if (target.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    };

    const options = {
      root: null,
      rootMargin: "15px",
      threshold: 0.95,
    };

    const observer = new IntersectionObserver(handleObserver, options);

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [hasMore, loading]);

  const setSelectedGroup = (value, name, color) => {
    dispatch(groupActions.setSelectedGroup(value));
    dispatch(groupActions.setSelectedName(name));
    dispatch(groupActions.setSelectedGroupColor(color));
  };

  const handleClick = (event, group, name, color) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    setSelectedGroup(group, name, color);
  };

  const renderGroupItemSkeleton = (index) => (
    <li key={`skeleton-${index}`} className="flex items-center p-2">
      <Skeleton variant="circular" width={55} height={55} />
      <div className="ml-2 flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" width="90%" height={75} />
        </div>
      </div>
    </li>
  );

  const renderGroupItem = (group, index) => (
    <li
      key={`${group._id}-${group.createdAt}-${index}`}
      onClick={(event) =>
        handleClick(
          event,
          `${group._id}-${group.createdAt}-${index}`,
          group.name || "Unnamed Group",
          group.color
        )
      }
      className={`group-item flex items-center sm:mx-2 sm:rounded-lg p-2 cursor-pointer ${
        selectedGroup === `${group._id}-${group.createdAt}-${index}`
          ? isdark
            ? "bg-[#8774e1] text-white"
            : "bg-[#2F2F2F] text-black bg-opacity-[0.17]"
          : isdark
          ? "hover:bg-gray-600"
          : "hover:bg-gray-100"
      } truncate`}
    >
      <CustomAvatar name={group.name || "Unnamed Group"} color={group.color} />
      <div className="ml-2 flex flex-1 min-w-0 justify-start items-center">
        <div className="flex justify-between items-center mb-1">
          <span className="truncate font-medium">
            {group.name || "Unnamed Group"}
          </span>
        </div>
      </div>
    </li>
  );

  const numSkeletonItems = Math.ceil(window.innerHeight / 70);

  const sortedGroupsList = [...groupsList].sort(
    (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
  );

  const groupsToRender =
    searchResult && searchResult.length > 0 ? searchResult : sortedGroupsList;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrorMessage("");
  };

  const handleCreateGroup = async () => {
    if (!groupName || !groupColor) {
      setErrorMessage("All fields are required.");
      return;
    }

    const response = await fetch(
      "https://pocketnotesappapi.vercel.app/api/groups",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: groupName, color: groupColor }),
      }
    );

    if (response.ok) {
      const newGroup = await response.json();
      setGroupsList([...groupsList, newGroup]);
      setGroupName("");
      setGroupColor("");
      handleClose();
    } else {
      const errorData = await response.json();
      if (errorData.error) {
        toast.error(errorData.error);
      } else {
        setErrorMessage("Failed to create group.");
      }
      setGroupName("");
      setGroupColor("");
    }
  };

  return (
    <div
      className={`relative w-full sm:w-[420px] h-full flex flex-col resize-x select-none transition-all ease ${
        isdark ? "bg-[#26292A]" : "bg-white"
      }`}
    >
      <Topbar />
      <div className="flex-1 overflow-y-auto transition-all ease">
        <ul className="w-full flex flex-col list-none">
          {loading && page === 1 ? (
            Array.from({ length: numSkeletonItems }).map((_, index) =>
              renderGroupItemSkeleton(index)
            )
          ) : (
            <>
              {groupsToRender.length > 0 &&
                groupsToRender.map((group, index) =>
                  renderGroupItem(group, index)
                )}
              {hasMore && !loading && (
                <div ref={loader} className="h-10">
                  {renderGroupItemSkeleton(0)}
                </div>
              )}
            </>
          )}
        </ul>
      </div>

      <IconButton
        onClick={handleOpen}
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "#001F8B",
          color: "white",
          borderRadius: "50%",
          width: "3rem",
          height: "3rem",
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        className={` font-semibold ${isdark ? " text-white" : " text-black"}`}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95%",
              sm: 400,
              md: 500,
              lg: 600,
              xl: 700,
            },
            bgcolor: isdark ? "#272727" : "white",
            boxShadow: 24,
            padding: "1.5rem 1.5rem 0.5rem 1.5rem",
            borderRadius: 1,
          }}
        >
          <h2>Create New Group</h2>
          {errorMessage && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{errorMessage}</p>
          )}
          <span className=" flex flex-nowrap items-center my-3 gap-2">
            <p className=" text-nowrap">Group Name</p>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "22px",
                border: "1px solid #ccc",
                color: "black",
              }}
            />
          </span>

          <div>
            <p className=" mb-2">Choose Colour</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {Object.entries(avatarColors).map(([colorName, colorValue]) => (
                <div
                  key={colorName}
                  onClick={() => setGroupColor(colorName)}
                  style={{
                    backgroundColor: colorValue.top,
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      groupColor === colorName
                        ? `2px solid ${isdark ? "white" : "black"}`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <span className=" flex justify-end mt-3">
            <button
              className={`${
                isdark ? "bg-[#001F8B] text-white" : "bg-[#001F8B] text-white"
              } px-6 py-0.5 rounded-lg`}
              onClick={handleCreateGroup}
            >
              Create
            </button>
          </span>
        </Box>
      </Modal>
      <Toaster />
    </div>
  );
};

export default Sidebar;
