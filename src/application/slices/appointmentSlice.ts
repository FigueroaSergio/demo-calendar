import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Appointment, CreateAppointmentDTO } from '../../domain/models/Appointment';
import { appointmentRepository } from '../services';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
};

// Thunks
export const fetchPatientAppointments = createAsyncThunk(
  'appointments/fetchPatientAppointments',
  async (patientId: string) => {
    return await appointmentRepository.getAppointmentsByPatient(patientId);
  }
);

export const bookNewAppointment = createAsyncThunk(
  'appointments/book',
  async (dto: CreateAppointmentDTO) => {
    return await appointmentRepository.bookAppointment(dto);
  }
);

export const cancelExistingAppointment = createAsyncThunk(
  'appointments/cancel',
  async ({ id, reason }: { id: string; reason?: string }) => {
    await appointmentRepository.cancelAppointment(id, reason);
    return id;
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch appointments';
      })
      .addCase(bookNewAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload);
      })
      .addCase(cancelExistingAppointment.fulfilled, (state, action) => {
        const appointment = state.appointments.find(a => a.id === action.payload);
        if (appointment) {
          appointment.status = 'CANCELLED';
        }
      });
  },
});

export default appointmentSlice.reducer;
