# Logging Configuration

This document describes the logging setup for the LocalService application.

## Overview

The application uses SLF4J with Logback as the logging framework. Logging has been implemented across all major components including:

- Controllers (REST endpoints)
- DAOs (Database operations)
- Configuration classes
- Main application class

## Log Levels

- **INFO**: General application flow, successful operations
- **DEBUG**: Detailed information for debugging (SQL queries, method calls)
- **WARN**: Warning conditions (e.g., failed login attempts, not found resources)
- **ERROR**: Error conditions with full stack traces

## Log Files

The application creates the following log files in the `logs/` directory:

- `localservice.log` - All application logs
- `localservice-error.log` - Only error level logs
- `localservice.YYYY-MM-DD.log` - Daily rolling log files

## Configuration

### application.properties
```properties
# Logging Configuration
logging.level.com.local.localservice=INFO
logging.level.org.springframework.web=INFO
logging.level.org.springframework.jdbc=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
```

### logback-spring.xml
Detailed logging configuration including:
- Console output
- File output with daily rolling
- Separate error log file
- Different log levels for different packages

## What Gets Logged

### Controllers
- HTTP request details (method, path, parameters)
- Response status and results
- Error conditions with stack traces
- Authentication attempts and results

### DAOs
- SQL query execution
- Database operation results
- Error conditions with full exception details
- Row counts for operations

### Application
- Startup and shutdown events
- Configuration loading

## Usage Examples

### Viewing Logs
```bash
# View real-time logs
tail -f logs/localservice.log

# View only errors
tail -f logs/localservice-error.log

# Search for specific patterns
grep "ERROR" logs/localservice.log
grep "POST /auth/login" logs/localservice.log
```

### Changing Log Levels
To change log levels at runtime, you can modify the `application.properties` file:

```properties
# For more detailed logging
logging.level.com.local.localservice=DEBUG

# For less verbose logging
logging.level.com.local.localservice=WARN
```

## Best Practices

1. **Use appropriate log levels**:
   - INFO for normal operations
   - DEBUG for detailed debugging information
   - WARN for recoverable issues
   - ERROR for exceptions and failures

2. **Include relevant context**:
   - User IDs, service IDs, booking IDs
   - Operation results (success/failure)
   - Performance metrics where relevant

3. **Avoid logging sensitive information**:
   - Passwords are not logged
   - Personal data is minimized in logs

4. **Monitor log files**:
   - Check for ERROR level messages
   - Monitor for unusual patterns
   - Rotate log files regularly 