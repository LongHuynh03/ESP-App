import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Redo, Undo } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ref, update, get } from "firebase/database";
import { db } from "../firebaseConfig";
import Slider from '@react-native-community/slider';

type DirectionType = "T" | "P" | "U" | "D" | "L" | "R";

const RootLayout = () => {
  const [status, setStatus] = useState("🔄 Đang kiểm tra kết nối...");
  const [message, setMessage] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  let directionRef = '';

  useEffect(() => {
    const fetchStatus = async () => {
      const statusRef = await get(ref(db, `esp32_info/status`));
      const snapshot = await get(ref(db, 'esp32_motor/speed'));
      if (statusRef.exists()) {
        setStatus(statusRef.val());
        setSliderValue(snapshot.val());
      } else {
        setStatus("fail");
        setSliderValue(0);
        setMessage("Không có dữ liệu trạng thái");
      }
      console.log(statusRef);
    };
    fetchStatus();
  }, []);

  const onChangeSliderValue = async (value: number) => {
    setSliderValue(value);
    try {
      await update(ref(db, 'esp32_motor'), {
        speed: value,
      });
    } catch (err: any) {
      console.log("Lỗi khi tăng giá trị:", err.message);
    }
  };

  const handlePressControl = async (direction: DirectionType) => {
    update(ref(db, `esp32_motor`), { direction: direction })
      .catch((err) =>
        setStatus("Lỗi khi gửi lệnh: " + err.message)
      );
  };

  // const handleLongPressControl = (direction: DirectionType) => {
  //   if (direction === "up" || direction === "down" || direction === "left" || direction === "right") {
  //     directionRef = 'esp32_direction';
  //   } else {
  //     directionRef = 'esp32_turn';
  //   }

  //   if (intervalRef.current) return;

  //   intervalRef.current = setInterval(async () => {
  //     try {
  //       const snapshot = await get(ref(db, `${directionRef}/${direction}`));
  //       const currentValue = snapshot.exists() ? snapshot.val() : 0;
  //       await update(ref(db, `${directionRef}`), {
  //         [direction]: currentValue + 1,
  //       });
  //     } catch (err: any) {
  //       console.log("Lỗi khi tăng giá trị:", err.message);
  //     }
  //   }, 500);
  // };

  // const handleReleaseControl = (direction: DirectionType) => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //     console.log("Dừng tăng giá trị");
  //     setTimeout(() => {
  //       update(ref(db, `${directionRef}`), { [direction]: 0 });
  //     }, 1000);
  //   }
  // };

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
        <Text style={styles.statusText}>Tốc độ: {sliderValue} m/s</Text>
      </View>

      {/* Nút điều khiển */}
      <View style={styles.controlContainer}>

        <View style={[styles.row, { gap: 140 }]}>
          <Slider
          style={styles.slider}
          value={sliderValue}
          step={1}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          onValueChange={(value) => onChangeSliderValue(value)}
        />
        </View>

        <View style={[styles.row, { gap: 140 }]}>
          <TouchableOpacity style={[styles.buttonO]}
            onPress={() => handlePressControl("T")}
            // onLongPress={() => handleLongPressControl("turn_left")}
            // onPressOut={() => handleReleaseControl("turn_left")}
          >
            <Undo size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonO]}
            onPress={() => handlePressControl("P")}
            // onLongPress={() => handleLongPressControl("turn_right")}
            // onPressOut={() => handleReleaseControl("turn_right")}
          >
            <Redo size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Up */}
        <View style={[styles.row, { gap: 10 }]}>
          <TouchableOpacity style={styles.button}
            onPress={() => handlePressControl("U")}
            // onLongPress={() => handleLongPressControl("up")}
            // onPressOut={() => handleReleaseControl("up")}
          >
            <ArrowUp size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Left - Right */}
        <View style={[styles.row, { gap: 100 }]}>
          <TouchableOpacity style={styles.button}
            onPress={() => handlePressControl("L")}
            // onLongPress={() => handleLongPressControl("left")}
            // onPressOut={() => handleReleaseControl("left")}
          >
            <ArrowLeft size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}
            onPress={() => handlePressControl("R")}
            // onLongPress={() => handleLongPressControl("right")}
            // onPressOut={() => handleReleaseControl("right")}
          >
            <ArrowRight size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Down */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}
            onPress={() => handlePressControl("D")}
            // onLongPress={() => handleLongPressControl("down")}
            // onPressOut={() => handleReleaseControl("down")}
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
    flex: 1,
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
    gap: 5,
  },
  slider: {
    width: 300,
    height: 10,
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
    marginHorizontal: 5,
  },
  buttonO: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
});