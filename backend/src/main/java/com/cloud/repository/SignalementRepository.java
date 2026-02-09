package com.cloud.repository;

import com.cloud.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, String> {
}
