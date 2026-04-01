import java.sql.Connection;
import java.sql.DriverManager;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/balance";
        String[] users = {"postgres", "riyak", "admin", "balance"};
        String[] passwords = {"postgres", "root", "admin", "password", "", "1234", "balance", "123456"};
        
        for (String user : users) {
            for (String pwd : passwords) {
                try {
                    Connection conn = DriverManager.getConnection(url, user, pwd);
                    System.out.println("Success with user " + user + " and password " + pwd + "");
                    return;
                } catch (Exception e) {}
            }
        }
        System.out.println("All combinations failed");
    }
}
