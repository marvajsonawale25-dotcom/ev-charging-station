package com.evcharging.repository;

import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.StationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long>, JpaSpecificationExecutor<ChargingStation> {
    List<ChargingStation> findByOperatorId(Long operatorId);
    List<ChargingStation> findByStatus(StationStatus status);
    List<ChargingStation> findByCityIgnoreCase(String city);
}
