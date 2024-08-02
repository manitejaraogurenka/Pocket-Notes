import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { groupActions } from "../store/group-slice";
import Linkify from "react-linkify";
import {
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MdEdit } from "react-icons/md";
import { CustomAvatar2 } from "./miscellaneous/Avatar";
import { GoDotFill } from "react-icons/go";
import { styled } from "@mui/system";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdSearch } from "react-icons/io";
import { IoMdShareAlt } from "react-icons/io";
import ShareModal from "./miscellaneous/ShareModal";

const StyledTextField = styled(TextField)(({ theme, isdark }) => ({
  color: isdark ? "white" : "black",
  "& .MuiInputBase-input": {
    color: isdark ? "white" : "black",
  },
  "& .MuiInputLabel-root": {
    color: isdark ? "white" : "black",
  },
}));

const NoteArea = () => {
  const dispatch = useDispatch();
  const { isdark } = useSelector((state) => state.lightDark);
  const { selectedGroup, notesForSelectedGroup, selectedName, selectedColor } =
    useSelector((state) => state.group);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editableNoteId, setEditableNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [localNotes, setLocalNotes] = useState(notesForSelectedGroup);
  const noteContainerRef = useRef(null);
  const noteEndRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" && window.innerWidth <= 640
  );
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState("");

  const handleOpenShareModal = (noteContent) => {
    setNoteToShare(noteContent);
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setNoteToShare("");
  };

  const noteRefs = useRef({});

  const setNoteRef = (id, element) => {
    noteRefs.current[id] = element;
  };

  const linkifyDecorator = (href, text, key) => (
    <a
      href={href}
      key={key}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline"
    >
      {text}
    </a>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        if (!selectedGroup) {
          console.error("No group selected.");
          return;
        }

        const groupId = selectedGroup.split("-")[0];

        if (!groupId) {
          console.error("Invalid group ID.");
          return;
        }

        const response = await axios.get(
          `https://pocketnotesappapi.vercel.app/api/groups/${groupId}/notes`
        );

        dispatch(groupActions.setNotesForSelectedGroup(response.data));
        setLocalNotes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setLoading(false);
        setError(error);
      }
    };

    if (selectedGroup) {
      fetchNotes();
    }
  }, [selectedGroup, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((noteEndRef.current, !searchQuery)) {
        noteEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [localNotes, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      const foundNote = localNotes.find((note) =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (foundNote && noteRefs.current[foundNote._id]) {
        noteRefs.current[foundNote._id].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [searchQuery, localNotes]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const postNote = async () => {
    if (inputValue.trim() === "") return;

    setLoading(true);
    try {
      const groupId = selectedGroup.split("-")[0];
      const response = await axios.post(
        `https://pocketnotesappapi.vercel.app/api/notes`,
        {
          groupId,
          content: inputValue,
        }
      );

      const newNote = response.data;
      dispatch(groupActions.addNoteToSelectedGroup(newNote));
      setLocalNotes((prevNotes) => [...prevNotes, newNote]);
      setInputValue("");
      setLoading(false);
    } catch (error) {
      console.error("Error posting note:", error);
      setLoading(false);
      setError(error);
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return (
      <span className="flex gap-1 items-center">
        {day} {month} {year} <GoDotFill /> {hours}:{minutes < 10 ? "0" : ""}
        {minutes} {period}
      </span>
    );
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const formatNoteContent = (content) => {
    const lines = content.split("\n");
    return (
      <>
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            {highlightText(line, searchQuery)}
            <br />
          </React.Fragment>
        ))}
      </>
    );
  };

  const handleEditClick = (noteId, currentContent) => {
    setEditableNoteId(noteId);
    setEditContent(currentContent);
  };

  const handleEditChange = (event) => {
    setEditContent(event.target.value);
  };

  const updateNote = async () => {
    if (editContent.trim() === "") return;

    setLoading(true);
    try {
      const response = await axios.put(
        `https://pocketnotesappapi.vercel.app/api/notes/${editableNoteId}`,
        {
          content: editContent,
        }
      );

      const updatedNote = response.data;
      dispatch(groupActions.updateNoteInSelectedGroup(updatedNote));
      setLocalNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === editableNoteId ? updatedNote : note
        )
      );
      setEditableNoteId(null);
      setEditContent("");
      setLoading(false);
    } catch (error) {
      console.error("Error updating note:", error);
      setLoading(false);
      setError(error);
    }
  };

  const deleteNote = async (noteId) => {
    setLoading(true);
    try {
      await axios.delete(
        `https://pocketnotesappapi.vercel.app/api/notes/${noteId}`
      );
      dispatch(groupActions.removeNoteFromSelectedGroup(noteId));
      setLocalNotes((prevNotes) =>
        prevNotes.filter((note) => note._id !== noteId)
      );
      setLoading(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      setLoading(false);
      setError(error);
    }
  };

  return (
    <div
      className={`h-screen ${
        isdark ? "bg-[#272727]" : "bg-[#DAE5F5]"
      } overflow-hidden  w-full`}
    >
      <div
        className={` py-2 px-5 w-full z-20 flex sticky top-0 items-center justify-between ${
          isdark ? "bg-[#212121]" : "bg-[#001F8B] text-white"
        } shadow-sm `}
      >
        <div className={`flex items-center justify-between`}>
          {isSmallScreen && (
            <span onClick={() => dispatch(groupActions.setSelectedGroup(""))}>
              <ArrowBackIcon
                style={{
                  fontSize: "26px",
                  color: "white",
                }}
                className={`rounded-full mr-4 cursor-pointer`}
              />
            </span>
          )}
          <div className="flex gap-4 items-center">
            <CustomAvatar2 name={selectedName} color={selectedColor} />
            <span className="text-2xl font-sans select-none">
              {selectedName}
            </span>
          </div>
        </div>
        <div className=" hidden lg:block">
          <TextField
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IoMdSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: isdark ? "#333" : "#fff",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
      <div
        ref={noteContainerRef}
        className="overflow-scroll w-full h-[80vh] px-4 pt-14 relative"
      >
        <div className="mt-8">
          {loading && (
            <div className="flex items-center justify-center h-full mt-5 w-full">
              <CircularProgress />
            </div>
          )}
          {error && <div>Error: {error.message}</div>}

          {localNotes.length > 0 && !loading ? (
            localNotes.map((note) => (
              <div
                key={note._id}
                className={`flex-1 w-full mb-4 ${"justify-start"} h-auto relative`}
                ref={(el) => setNoteRef(note._id, el)}
              >
                <div
                  className={`${isdark ? "bg-[#3c3c3c]" : "bg-white"} text-${
                    isdark ? "white" : "black"
                  } p-2 pb-10 rounded-[4px] shadow`}
                >
                  {editableNoteId === note._id ? (
                    <>
                      <StyledTextField
                        multiline
                        isdark={isdark}
                        value={editContent}
                        onChange={handleEditChange}
                        fullWidth
                        rows={Math.max(4, editContent.split("\n").length)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={updateNote}
                          disabled={loading || editContent.trim() === ""}
                          style={{
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            marginLeft: "8px",
                            borderRadius: "8px",
                            cursor:
                              loading || editContent.trim() === ""
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {loading ? <CircularProgress size={24} /> : "Save"}
                        </button>
                        <button
                          onClick={() => setEditableNoteId(null)}
                          disabled={loading}
                          style={{
                            backgroundColor: "gray",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            marginLeft: "8px",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Linkify componentDecorator={linkifyDecorator}>
                        <span
                          className="font-Poppins text-sm preformatted-text"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {formatNoteContent(note.content)}
                        </span>
                      </Linkify>

                      <span
                        className={`text-[10px] flex gap-4 items-center font-medium ${
                          isdark ? "text-gray-300" : "text-[#353535]"
                        }  absolute bottom-2 right-2 select-none`}
                      >
                        <IoMdShareAlt
                          onClick={() => handleOpenShareModal(note.content)}
                          size={16}
                          className=" cursor-pointer"
                        />

                        <MdEdit
                          onClick={() =>
                            handleEditClick(note._id, note.content)
                          }
                          size={16}
                          className=" cursor-pointer"
                        />
                        <AiOutlineDelete
                          onClick={() => deleteNote(note._id)}
                          size={16}
                          className="cursor-pointer"
                        />

                        {formatTime(note.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {!loading && "No notes yet!"}
            </div>
          )}
          <div ref={noteEndRef}></div>
        </div>
      </div>
      <div
        className={`sticky bottom-0 ${
          isdark ? "bg-transparent" : "bg-[#001F8B]"
        } flex-1 w-full items-center p-2 z-20 text-white`}
      >
        <textarea
          placeholder="Enter your text here..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              postNote();
            }
          }}
          style={{
            width: "100%",
            borderRadius: "14px",
            height: "8rem",
            backgroundColor: isdark ? "#212121" : "white",
            color: isdark ? "white" : "black",
            paddingRight: "3rem",
            paddingTop: "1rem",
            borderColor: isdark ? "#333" : "#ccc",
            resize: "none",
            outline: "none",
            padding: "1rem",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        />
        <InputAdornment position="end">
          <IconButton
            onClick={postNote}
            disabled={loading || inputValue.trim() === ""}
            sx={{
              position: "absolute",
              right: "1rem",
              bottom: "1rem",
              color: inputValue.trim() === "" ? "gray" : "#001F8B",
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <SendIcon
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  color: inputValue.trim() === "" ? "gray" : "#001F8B",
                  padding: "8px",
                  borderRadius: "100%",
                }}
              />
            )}
          </IconButton>
        </InputAdornment>
      </div>
      <ShareModal
        open={isShareModalOpen}
        onClose={handleCloseShareModal}
        noteContent={noteToShare}
      />
    </div>
  );
};

export default NoteArea;
