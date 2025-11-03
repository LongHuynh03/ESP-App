import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../firebaseConfig";

type DirectionType = "up" | "down" | "left" | "right";

const RootLayout = () => {
  const [status, setStatus] = useState("🔄 Đang kiểm tra kết nối...");
  const [message, setMessage] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const statusRef = await get(ref(db, `esp32_info/status`));
      if (statusRef.exists()) {
        setStatus(statusRef.val());
      } else {
        setStatus("fail");
        setMessage("Không có dữ liệu trạng thái");
      }
      console.log(statusRef);
    };
    fetchStatus();
  }, []);

  const handlePressControl = (direction: DirectionType, step: number) => {
    update(ref(db, `esp32_direction`), { [direction]: step })
    .then(() => setTimeout(() => {
      update(ref(db, `esp32_direction`), { [direction]: 0 });
    }, 1000))
    .catch((err) =>
      setStatus("Lỗi khi gửi lệnh: " + err.message)
    );
  };

  const handleLongPressControl = (direction: DirectionType) => {

    if (intervalRef.current) return;

    intervalRef.current = setInterval(async () => {
      try {
        const snapshot = await get(ref(db, `esp32_direction/${direction}`));
        const currentValue = snapshot.exists() ? snapshot.val() : 0;
        await update(ref(db, `esp32_direction`), {
          [direction]: currentValue + 1,
        });
      } catch (err: any) {
        console.log("Lỗi khi tăng giá trị:", err.message);
      }
    }, 200);
  };

  const handleReleaseControl = (direction: DirectionType) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("Dừng tăng giá trị");
      setTimeout(() => {
        update(ref(db, `esp32_direction`), { [direction]: 0 });
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Màn hình video */}
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: 'https://your-stream-url/video' }}
          style={styles.video}
          resizeMode="cover"
        />
      </View>

      {/* Bảng trạng thái */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Pin: 85%</Text>
        <Text style={styles.statusText}>Kết nối: {status}</Text>
        <Text style={styles.statusText}>Tin nhắn: {message}</Text>
        <Text style={styles.statusText}>Tốc độ: 0.5 m/s</Text>
      </View>

      {/* Nút điều khiển */}
      <View style={styles.controlContainer}>
        {/* Up */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} 
          onPress={() => handlePressControl("up", 1)}
          onLongPress={() => handleLongPressControl("up")}
          onPressOut={() => handleReleaseControl("up")}
        >
          <ArrowUp size={30} color="white" />
        </TouchableOpacity>
      </View>

        {/* Left - Right */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} 
          onPress={() => handlePressControl("left", 1)}
          onLongPress={() => handleLongPressControl("left")}
          onPressOut={() => handleReleaseControl("left")}
          >
            <ArrowLeft size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} 
          onPress={() => handlePressControl("right", 1)}
          onLongPress={() => handleLongPressControl("right")}
          onPressOut={() => handleReleaseControl("right")}
          >
            <ArrowRight size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Down */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} 
          onPress={() => handlePressControl("down", 1)}
          onLongPress={() => handleLongPressControl("down")}
          onPressOut={() => handleReleaseControl("down")}
          >
            <ArrowDown size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 10,
  },
  videoContainer: {
    flex: 4,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  statusContainer: {
    flex: 2,
    backgroundColor: '#1e1e1e',
    marginVertical: 10,
    borderRadius: 12,
    padding: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusText: {
    color: '#bbb',
    fontSize: 15,
  },
  controlContainer: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  button: {
    width: 90,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
});