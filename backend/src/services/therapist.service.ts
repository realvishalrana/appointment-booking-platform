import { userRepository } from "../repositories/user.repository";

export const therapistService = {
  listTherapists() {
    return userRepository.findTherapists();
  },

  getTherapistById(id: number) {
    return userRepository.findTherapistById(id);
  },
};
