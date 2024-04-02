import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (userCredentials) => {
    const request = await fetch("http://localhost:3001/api/v1/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    const reponseData = await request.json();

    const token = reponseData.body.token;
    localStorage.setItem("token", token);

    if (token) {
      const responseProfile = await fetch(
        "http://localhost:3001/api/v1/user/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userData = await responseProfile.json();
      localStorage.setItem("user", JSON.stringify(userData.body));
      return userData;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.data = null;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        console.log(action.error.message);
        if (action.error.message === "Request failed with status code 400") {
          state.error = "Accès refusé ! Données invalides";
        } else {
          state.error = action.error.message;
        }
      });
  },
});
export default userSlice.reducer;