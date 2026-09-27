package com.evcharging.repository;

import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);
    long countByStatus(ChargerStatus status);
    long countByStationIdAndStatus(Long stationId, ChargerStatus status);
    long countByStationId(Long stationId);
}
