package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.config.JwtTokenProvider;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Address;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.AddressRepository;
import org.harsha.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtProvider;
    private final AddressRepository addressRepository;

    @Override
    public User findUserById(Long userId) throws UserException {
        Optional<User> opt = userRepository.findById(userId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new UserException("User not found with id: " + userId);
    }

    @Override
    public User findUserProfileByJwt(String jwt) throws UserException {
        String email = jwtProvider.getEmailFromToken(jwt);
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Address addAddress(User user, Address address) {
        address.setUser(user);
        Address saved = addressRepository.save(address);
        user.getAddresses().add(saved);
        userRepository.save(user);
        return saved;
    }

    @Override
    public User updateUserRole(Long userId, String role) throws UserException {
        User user = findUserById(userId);
        user.setRole(role);
        return userRepository.save(user);
    }
}