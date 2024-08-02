import React, { useRef, useState, useEffect, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { useDispatch, useSelector } from "react-redux";
import { groupActions } from "../../store/group-slice";
import MenuCard from "./MenuCard";
import debounce from "lodash/debounce";

const RotatingIconContainer = styled("span")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "30px",
  height: "30px",
  padding: "20px",
  transition: "transform 0.25s ease-in-out",
});

const Topbar = () => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [placeholderAnimated, setPlaceholderAnimated] = useState(false);
  const { isdark } = useSelector((state) => state.lightDark);

  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      try {
        const response = await fetch(
          `https://pocketnotesappapi.vercel.app/api/groups/search?query=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        console.log(data.data);
        dispatch(groupActions.setSearchResult(data.data));
      } catch (error) {
        console.error("Failed to fetch search results", error);
      }
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    if (inputValue) {
      fetchSearchResults(inputValue);
    } else {
      dispatch(groupActions.setSearchResult([]));
    }
  }, [inputValue, fetchSearchResults, dispatch]);

  const handleArrowBackClick = () => {
    setInputValue("");
    inputRef.current.blur();
    setIsFocused(false);
    dispatch(groupActions.setSearch(""));
    if (!placeholderAnimated && inputValue) {
      setPlaceholderAnimated(true);
    }
    setTimeout(() => setPlaceholderAnimated(false), 100);
  };

  const handleSearchContainerClick = () => {
    inputRef.current.focus();
    setIsFocused(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleClearInput = () => {
    setInputValue("");
    inputRef.current.focus();
    dispatch(groupActions.setSearch(""));
    if (!placeholderAnimated && inputValue) {
      setPlaceholderAnimated(true);
    }
    setTimeout(() => setPlaceholderAnimated(false), 100);
  };

  const handleMenuClick = (event) => {
    setMenuOpen(true);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <div
      className={`sticky top-0 flex-col h-24 px-2 items-center justify-center gap-2 select-none w-full sm:w-[420px] resize-x transition-all ease-in ${
        isdark ? "bg-[#212121]" : "bg-white"
      }`}
    >
      <div className=" flex items-center justify-center p-2 text-2xl font-bold">
        Pocket Notes
      </div>
      <div className=" flex w-full">
        <RotatingIconContainer
          onClick={isFocused ? handleArrowBackClick : handleMenuClick}
          style={{
            transform: isFocused ? "rotate(180deg)" : "none",
            cursor: "pointer",
          }}
          className={` ${
            isdark ? "hover:bg-slate-800" : "hover:bg-slate-100"
          } rounded-full sm:ml-2`}
        >
          {!isFocused ? (
            <MenuIcon
              style={{
                fontSize: 26,
                color: isdark ? "" : "rgba(0, 0, 0, 0.5)",
              }}
            />
          ) : (
            <ArrowBackIcon
              style={{
                fontSize: 26,
                color: isdark ? "white" : "rgba(0, 0, 0, 0.5)",
                transform: "rotate(180deg)",
              }}
            />
          )}
        </RotatingIconContainer>

        <div
          className={`flex gap-2 rounded-lg border-2 items-center ${
            isFocused
              ? "border-[#3390ec]"
              : isdark
              ? "border-gray-500"
              : "border-gray-200"
          } w-full px-2 py-1.5 mx-2 cursor-pointer`}
          onClick={handleSearchContainerClick}
        >
          <SearchIcon
            fontSize="medium"
            style={{
              color: isFocused
                ? "#3390EC"
                : isdark
                ? "rgba(255, 255, 255, 0.3)"
                : "rgba(0, 0, 0, 0.3)",
            }}
            className="mt-0.5 ml-0.5"
          />

          <input
            ref={inputRef}
            className={`outline-none text-sm w-full mr-1.5 pr-1 topbar-search-input ${
              placeholderAnimated ? "placeholder-animated" : ""
            } ${isdark ? "dark-mode" : ""}`}
            placeholder="Search"
            value={inputValue}
            onChange={handleInputChange}
            onAnimationEnd={() => setPlaceholderAnimated(false)}
            style={{
              fontSize: "16px",
              transition: "font-size 0.4s ease-in-out",
              backgroundColor: isdark ? "#212121" : "white",
            }}
          />

          {inputValue && isFocused && (
            <CloseIcon
              fontSize="medium"
              style={{ color: "#3390ec", cursor: "pointer" }}
              className=" hover:bg-blue-100 p-0.5 rounded-full"
              onClick={handleClearInput}
            />
          )}
        </div>
        <MenuCard
          isOpen={menuOpen}
          onClose={handleMenuClose}
          anchorEl={menuAnchorEl}
        />
      </div>
    </div>
  );
};

export default Topbar;
