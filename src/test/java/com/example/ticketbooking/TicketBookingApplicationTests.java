package com.example.ticketbooking;

import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.LeagueRepository;
import com.example.ticketbooking.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TicketBookingApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private LeagueRepository leagueRepository;

	@Autowired
	private EventRepository eventRepository;

	@Autowired
	private UserRepository userRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void defaultDataAndAccountsAreSeeded() {
		assertThat(leagueRepository.count()).isGreaterThanOrEqualTo(6);
		assertThat(eventRepository.count()).isGreaterThanOrEqualTo(12);
		assertThat(userRepository.findByUsername("Alogo12")).isPresent();
		assertThat(userRepository.findByUsername("cashier1")).isPresent();
	}

	@Test
	void publicEndpointsRespondSuccessfully() throws Exception {
		mockMvc.perform(get("/"))
				.andExpect(status().isOk());

		mockMvc.perform(get("/api/events"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(12)));

		mockMvc.perform(get("/api/leagues"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(6)));

		mockMvc.perform(get("/api/payments/client-key"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.clientKey").exists());

		mockMvc.perform(get("/api/auth/google/client-id"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.clientId").exists());
	}

	@Test
	void adminCanLoginAndVerifyJwtToken() throws Exception {
		String loginBody = """
				{
				  "username": "Alogo12",
				  "password": "Alogo.situ24"
				}
				""";

		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginBody))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(jsonPath("$.role").value("ADMIN"))
				.andReturn();

		JsonNode json = objectMapper.readTree(loginResult.getResponse().getContentAsString());
		String token = json.get("accessToken").asText();

		mockMvc.perform(get("/api/auth/verify")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value("Alogo12"))
				.andExpect(jsonPath("$.role").value("ADMIN"));
	}

	@Test
	void googleAuthReturnsServiceUnavailableWhenUnconfigured() throws Exception {
		mockMvc.perform(post("/api/auth/google")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"credential\":\"dummy-token\"}"))
				.andExpect(status().isServiceUnavailable())
				.andExpect(jsonPath("$.success").value(false));
	}
}
