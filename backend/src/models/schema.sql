-- Database Schema for College Compass

-- Drop tables if they exist
DROP TABLE IF EXISTS cutoffs;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS colleges;

-- 1. College Table
CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'IIT', 'NIT', 'IIIT', 'GFTI', 'State Government', 'Private'
    nirf_rank INTEGER,
    naac_grade VARCHAR(10),
    website VARCHAR(255),
    application_link VARCHAR(255),
    average_package NUMERIC(10, 2), -- in LPA
    highest_package NUMERIC(10, 2), -- in LPA
    tuition_fee NUMERIC(12, 2), -- annual tuition fee in INR
    hostel_fee NUMERIC(12, 2) -- annual hostel fee in INR
);

-- 2. Course Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL, -- e.g., 'Computer Science & Engineering'
    duration INTEGER DEFAULT 4 -- years
);

-- 3. Cutoff Table
CREATE TABLE cutoffs (
    id SERIAL PRIMARY KEY,
    college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    exam VARCHAR(50) NOT NULL, -- e.g., 'JEE Main', 'JEE Advanced', 'MHT-CET', 'KCET', 'EAMCET'
    category VARCHAR(50) NOT NULL, -- e.g., 'General', 'OBC', 'EWS', 'SC', 'ST'
    year INTEGER NOT NULL,
    opening_rank INTEGER NOT NULL,
    closing_rank INTEGER NOT NULL
);

-- Indices for faster querying
CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_type ON colleges(type);
CREATE INDEX idx_courses_college ON courses(college_id);
CREATE INDEX idx_cutoffs_lookup ON cutoffs(exam, category, closing_rank);
CREATE INDEX idx_cutoffs_college ON cutoffs(college_id);
