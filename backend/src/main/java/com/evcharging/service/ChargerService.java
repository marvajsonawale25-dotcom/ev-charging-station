package com.evcharging.service;

import com.evcharging.dto.ChargerRequest;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargerStatus;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.Role;
import com.evcharging.entity.User;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.ChargerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChargerService {

    private final ChargerRepository chargerRepository;
    private final StationService stationService;

    public ChargerService(ChargerRepository chargerRepository, StationService stationService) {
        this.chargerRepository = chargerRepository;
        this.stationService = stationService;
    }

    public List<Charger> getChargersByStationId(Long stationId) {
        return chargerRepository.findByStationId(stationId);
    }

    public Charger getChargerById(Long id) {
        return chargerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charger not found with ID: " + id));
    }

    @Transactional
    public Charger addCharger(ChargerRequest request, User currentUser) {
        ChargingStation station = stationService.getStationById(request.getStationId());

        if (currentUser != null && currentUser.getRole() == Role.ROLE_OPERATOR) {
            if (station.getOperator() == null || !station.getOperator().getId().equals(currentUser.getId())) {
                throw new BadRequestException("You can only manage chargers belonging to your station.");
            }
        }

        Charger charger = Charger.builder()
                .station(station)
                .identifier(request.getIdentifier().trim())
                .chargerType(request.getChargerType())
                .connectorType(request.getConnectorType())
                .powerRatingKw(request.getPowerRatingKw())
                .pricePerKwh(request.getPricePerKwh())
                .status(request.getStatus() != null ? request.getStatus() : ChargerStatus.AVAILABLE)
                .build();

        return chargerRepository.save(charger);
    }

    @Transactional
    public Charger addCharger(ChargerRequest request) {
        return addCharger(request, null);
    }

    @Transactional
    public Charger updateChargerStatus(Long id, ChargerStatus status, User currentUser) {
        Charger charger = getChargerById(id);
        if (currentUser != null && currentUser.getRole() == Role.ROLE_OPERATOR) {
            if (charger.getStation() == null || charger.getStation().getOperator() == null 
                    || !charger.getStation().getOperator().getId().equals(currentUser.getId())) {
                throw new BadRequestException("You can only manage chargers belonging to your station.");
            }
        }
        charger.setStatus(status);
        return chargerRepository.save(charger);
    }

    @Transactional
    public Charger updateChargerStatus(Long id, ChargerStatus status) {
        return updateChargerStatus(id, status, null);
    }

    @Transactional
    public void deleteCharger(Long id, User currentUser) {
        Charger charger = getChargerById(id);
        if (currentUser != null && currentUser.getRole() == Role.ROLE_OPERATOR) {
            if (charger.getStation() == null || charger.getStation().getOperator() == null 
                    || !charger.getStation().getOperator().getId().equals(currentUser.getId())) {
                throw new BadRequestException("You can only manage chargers belonging to your station.");
            }
        }
        chargerRepository.delete(charger);
    }

    @Transactional
    public void deleteCharger(Long id) {
        deleteCharger(id, null);
    }
}
