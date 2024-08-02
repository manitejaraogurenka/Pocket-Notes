import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import NoteArea from "./components/NoteArea";
import { useSelector } from "react-redux";
import { MdLock } from "react-icons/md";

const App = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" && window.innerWidth <= 640
  );

  const { isdark } = useSelector((state) => state.lightDark);
  const { selectedGroup } = useSelector((state) => state.group);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${!isdark ? "bg-[#DAE5F5]" : "bg-[#3c3c3c]"} 
        `}
    >
      <div
        className={`flex w-screen overflow-hidden h-screen ${
          isdark ? "text-white" : ""
        }`}
      >
        {isSmallScreen ? (
          selectedGroup ? (
            <NoteArea />
          ) : (
            <Sidebar />
          )
        ) : (
          <>
            <Sidebar />
            <div className="h-screen w-full relative">
              {!selectedGroup && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <img
                    src="/landing.png"
                    alt="Pocket Notes"
                    className="w-full h-auto"
                  />
                  <div className="mt-4">
                    <h1 className="text-2xl font-bold">Pocket Notes</h1>
                    <p className="mt-2 text-base">
                      Send and receive messages without keeping your phone
                      online.
                      <br />
                      Use Pocket Notes on up to 4 linked devices and 1 mobile
                      phone
                    </p>
                    <p className="mt-6 text-sm flex items-center justify-center gap-2">
                      <MdLock className=" mt-1" />
                      end-to-end encrypted
                    </p>
                  </div>
                </div>
              )}
              {selectedGroup && <NoteArea />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
