import React from "react";
import {
  Modal,
  Button,
  Checkbox,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import { styled } from "@mui/system";
import { useSelector } from "react-redux";

const ShareModal = ({ open, onClose, noteContent }) => {
  const { isdark } = useSelector((state) => state.lightDark);

  const ModalContent = styled(Box)(({ theme }) => ({
    backgroundColor: isdark ? "#282828" : "#ffffff",
    color: isdark ? "#ffffff" : "#001F8B",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    maxWidth: 400,
    margin: "0 auto",
    position: "relative",
    top: "20%",
  }));

  const GroupList = styled(Box)(({ theme }) => ({
    maxHeight: 300,
    overflowY: "auto",
    marginBottom: theme.spacing(2),
  }));

  const Error = styled(Typography)(({ theme }) => ({
    color: "red",
    marginTop: theme.spacing(2),
  }));

  const [groups, setGroups] = React.useState([]);
  const [selectedGroups, setSelectedGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          "https://pocketnotesappapi.vercel.app/api/groups"
        );
        setGroups(response.data.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError(error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupChange = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      await Promise.all(
        selectedGroups.map((groupId) =>
          axios.post("https://pocketnotesappapi.vercel.app/api/notes", {
            groupId,
            content: noteContent,
          })
        )
      );
      setSelectedGroups([]);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Error sharing note:", error);
      setLoading(false);
      setError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        <Typography variant="h6">Share Note</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <GroupList>
              {groups.map((group) => (
                <Box key={group._id} display="flex" alignItems="center" mb={1}>
                  <Checkbox
                    checked={selectedGroups.includes(group._id)}
                    onChange={() => handleGroupChange(group._id)}
                  />
                  <Typography variant="body1">{group.name}</Typography>
                </Box>
              ))}
            </GroupList>
            <Button
              onClick={handleShare}
              disabled={loading || selectedGroups.length === 0}
              sx={{
                backgroundColor: "#001F8B",
                color: isdark ? "#ffffff" : "#ffffff",
                marginRight: 1,
              }}
            >
              Share
            </Button>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{
                backgroundColor: isdark ? "#424242" : "#ffffff",
                color: isdark ? "#ffffff" : "#001F8B",
              }}
            >
              Cancel
            </Button>
            {error && <Error>Error: {error.message}</Error>}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
